// Mock implementation for Quagga
const Quagga = {
    init: () => Promise.resolve({ started: false }),
    start: () => {},
    stop: () => {},
    onDetected: () => {}
  };
  
  export default Quagga;