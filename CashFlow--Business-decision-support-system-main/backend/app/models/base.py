from pydantic import BaseModel, ConfigDict
from bson import ObjectId
from typing import Any, Union
from pydantic_core import CoreSchema, core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v: Union[str, ObjectId, 'PyObjectId']) -> ObjectId:
        # If already an ObjectId or PyObjectId, return as-is
        if isinstance(v, (ObjectId, PyObjectId)):
            return v
        
        # If a string, validate and convert
        if isinstance(v, str):
            # Strip any whitespace
            v = v.strip()
            
            # Check if valid ObjectId
            if not ObjectId.is_valid(v):
                raise ValueError(f"Invalid ObjectId: {v}")
            
            return ObjectId(v)
        
        # If not a string or ObjectId, raise an error
        raise ValueError(f"Cannot convert {type(v)} to ObjectId")

    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Any,
    ) -> CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.is_instance_schema(cls),
                core_schema.str_schema(),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x),
                return_schema=core_schema.str_schema(),
                when_used='json'
            ),
        )

    def __str__(self):
        return str(super().__str__())

    def __repr__(self):
        return f"PyObjectId({super().__str__()})"

class BaseDBModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str, PyObjectId: str},
        from_attributes=True
    )

    def model_dump(self, **kwargs):
        kwargs.setdefault("by_alias", True)
        data = super().model_dump(**kwargs)
        # Convert all ObjectId and PyObjectId instances to strings
        for key, value in list(data.items()):
            if isinstance(value, (ObjectId, PyObjectId)):
                data[key] = str(value)
            elif isinstance(value, dict):
                # Recursively convert nested ObjectIds
                for nested_key, nested_value in list(value.items()):
                    if isinstance(nested_value, (ObjectId, PyObjectId)):
                        value[nested_key] = str(nested_value)
        return data