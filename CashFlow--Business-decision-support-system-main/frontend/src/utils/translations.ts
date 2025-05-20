import { ReactNode } from "react";

// src/utils/translations.ts
export type TranslationKeys = 'en' | 'si' | 'ta';

export interface Translation {
  inventory: any;
  login: string;
  register: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  signIn: string;
  signOut: string;
  forgotPassword: string;
  rememberMe: string;
  registerNow: string;
  loginNow: string;
  registerButton: string;

  app: {
    name: string;
    tagline: string;
    welcome: string;
  };
  nav: {
    dashboard: string;
    pos: string;
    inventory: string;
    orders: string;
    customers: string;
    invoices: string;
    settings: string;
    help: string;
  };
  common: {
    discardChanges: ReactNode;
    discardChangesMessage: ReactNode;
    discard: ReactNode;
    email: ReactNode;
    phone: ReactNode;
    address: ReactNode;
    notes: ReactNode;
    product: ReactNode;
    search: string;
    notifications: string;
    noData: string;
    loading: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    close: string;
    confirm: string;
    back: string;
    next: string;
    create: string;
    actions: string;
    status: string;
    date: string;
    time: string;
    amount: string;
    total: string;
    subtotal: string;
    tax: string;
    discount: string;
    quantity: string;
    price: string;
    name: string;
    description: string;
    category: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    markAllAsRead: string;
    todayAt: string;
    yesterdayAt: string;
    refresh: string; 
    retry: string;   
  };
  userMenu: {
    profile: string;
    settings: string;
    logout: string;
    switchAccount: string;
  };
  // dashboard: {
  //   welcome: string;
  //   salesOverview: string;
  //   topProducts: string;
  //   recentOrders: string;
  //   recentSales: string;
  // };
  help: {
    title: string;
    description: string;
    tabs: {
      userManual: string;
      faq: string;
      about: string;
      support: string;
    },
    userManual: {
      title: string;
      introduction: string;
      sections: {
        dashboard: {
          title: string;
          description: string;
          features: {
            salesSummary: {
              title: string;
              description: string;
            },
            inventoryStatus: {
              title: string;
              description: string;
            },
            recentOrders: {
              title: string;
              description: string;
            }
          }
        },
        pos: {
          title: string;
          description: string;
          features: {
            productSelection: {
              title: string;
              description: string;
            },
            customerSelection: {
              title: string;
              description: string;
            },
            paymentProcessing: {
              title: string;
              description: string;
            },
            orderCreation: {
              title: string;
              description: string;
            }
          }
        },
        inventory: {
          title: string;
          description: string;
          features: {
            productManagement: {
              title: string;
              description: string;
            },
            categoryManagement: {
              title: string;
              description: string;
            },
            stockAdjustments: {
              title: string;
              description: string;
            }
          }
        },
        orders: {
          title: string;
          description: string;
          features: {
            orderTracking: {
              title: string;
              description: string;
            },
            orderDetails: {
              title: string;
              description: string;
            },
            orderManagement: {
              title: string;
              description: string;
            }
          }
        },
        customers: {
          title: string;
          description: string;
          features: {
            customerDatabase: {
              title: string;
              description: string;
            },
            customerCreation: {
              title: string;
              description: string;
            },
            purchaseHistory: {
              title: string;
              description: string;
            }
          }
        },
        settings: {
          title: string;
          description: string;
          features: {
            businessSettings: {
              title: string;
              description: string;
            },
            taxSettings: {
              title: string;
              description: string;
            },
            userManagement: {
              title: string;
              description: string;
            }
          }
        }
      }
    },
    faq: {
      title: string;
      cantFindQuestion: string;
      contactSupport: string;
      questions: {
        q1: {
          question: string;
          answer: string;
        },
        q2: {
          question: string;
          answer: string;
        },
        q3: {
          question: string;
          answer: string;
        },
        q4: {
          question: string;
          answer: string;
        },
        q5: {
          question: string;
          answer: string;
        }
      }
    },
    about: {
      title: string;
      version: string;
      description: string;
      features: {
        pos: {
          title: string;
          description: string;
        },
        inventory: {
          title: string;
          description: string;
        },
        orders: {
          title: string;
          description: string;
        },
        customers: {
          title: string;
          description: string;
        }
      },
      systemRequirements: {
        title: string;
        requirements: {
          os: string;
          browser: string;
          connection: string;
          screen: string;
        }
      },
      legalInformation: {
        title: string;
        copyright: string;
        termsOfService: string;
        privacyPolicy: string;
        licenseAgreement: string;
      }
    },
    support: {
      title: string;
      emailSupport: {
        title: string;
        description: string;
        email: string;
        responseTime: string;
        buttonText: string;
      },
      liveChat: {
        title: string;
        description: string;
        hours: string;
        waitTime: string;
        buttonText: string;
      },
      supportTicket: {
        title: string;
        description: string;
        form: {
          subject: string;
          description: string;
          email: string;
          submit: string;
        }
      },
      commonTopics: {
        title: string;
        passwordReset: string;
        networkIssues: string;
        dataImportExport: string;
        printerSetup: string;
      }
    }
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  languages: {
    en: string;
    si: string;
    ta: string;
    select: string;
  };
  pos: {
    title: string;
    cart: {
      scanBarcode: string;
      empty: string;
      customerSearch: string;
      customerLabel: string;
      noCustomersFound: string;
      totalItems: string;
      each: string;
      searchPlaceholder: string;
      noProductsFound: string;
      noProductsMatchSearch: string;
      quantity: string;
      productStatus: {
        outOfStock: string;
        lowStock: string;
        inStock: string;
      };
    };
    payment: {
      taxAndDiscount: string;
      paymentMethods: string;
      summary: string;
      tax: string;
      taxDefault: string;
      discount: string;
      deliveryDate: string;
      cash: string;
      card: string;
      bankTransfer: string;
      subtotal: string;
      total: string;
      remaining: string;
      change: string;
      completePayment: string;
      createOrder: string;
      tooltips: {
        addItems: string;
        insufficientPayment: string;
        readyToComplete: string;
        selectCustomer: string;
        readyToOrder: string;
      };
    };
    alerts: {
      error: {
        emptyCart: string;
        insufficientPayment: string;
        createOrder: string;
        noCustomer: string;
        generic: string;
        orderGeneric: string;
      };
      success: {
        orderCreated: string;
      };
    };
  };
  orders: {
    title: string;
    newOrder: string;
    orderList: string;
    orderDetails: string;
    editOrder: string;
    noOrders: string;
    itemCount: string; // "{count} items"
    status: {
      all: string;
      pending: string;
      completed: string;
      cancelled: string;
    };
    fields: {
      completedDate: ReactNode;
      saleId: ReactNode;
      orderId: string;
      created: string;
      deliveryDate: string;
      customer: string;
      items: string;
      subtotal: string;
      total: string;
      status: string;
      actions: string;
    };
    filters: {
      search: string;
      dateRange: string;
      allTime: string;
      today: string;
      yesterday: string;
      thisWeek: string;
      lastWeek: string;
      thisMonth: string;
      lastMonth: string;
    };
    actions: {
      view: string;
      edit: string;
      complete: string;
      cancel: string;
      back: string;
      save: string;
      saveChanges: string;
      saving: string;
    };
    dialogs: {
      complete: {
        title: string;
        message: string;
        confirm: string;
      };
      cancel: {
        title: string;
        message: string;
        confirm: string;
      };
    };
    messages: {
      noCustomerData: ReactNode;
      loading: string;
      noData: string;
      fetchError: string;
      updateSuccess: string;
      updateError: string;
      completeSuccess: string;
      completeError: string;
      cancelSuccess: string;
      cancelError: string;
    };
    pricing: {
      title: string;
      tax: string;
      taxPercentage: string;
      discount: string;
      discountPercentage: string;
    };
    orderInfo: {
      title: string;
      readOnlyItems: string;
      readOnlyMessage: string;
    };
  };
  customers: {
    title: string;
    addCustomer: string;
    editCustomer: string;
    deleteCustomer: string;
    search: string;
    fields: {
      name: string;
      email: string;
      phone: string;
      address: string;
      discountEligible: string;
    };
    placeholders: {
      name: string;
      email: string;
      phone: string;
      address: string;
      phoneHelp: string;
    };
    actions: {
      edit: string;
      delete: string;
      add: string;
      update: string;
      cancel: string;
    };
    deleteConfirm: {
      title: string;
      message: string;
    };
    validation: {
      required: {
        name: string;
        email: string;
      };
      invalid: {
        email: string;
        phone: string;
      };
    };
    messages: {
      addSuccess: string;
      updateSuccess: string;
      deleteSuccess: string;
      error: {
        fetch: string;
        add: string;
        update: string;
        delete: string;
      };
    };
    status: {
      yes: string;
      no: string;
      na: string;
    };
  };
  dashboard: {
    welcome: string;
    salesOverview: string;
    topProducts: string;
    recentOrders: string;
    recentSales: string;
    
    // Add these new fields for predictions
    title: string;
    description: string;
    comingSoon: string;
    tabs: {
      overview: string;
      predictions: string;
      reports: string;
    };
    predictions: {
      title: string;
      noPredictions: string;
      dataTooltip: string;
      daysOfData: string;
      trainModels: string;
      switchView: string;
      tabs: {
        tomorrow: string;
        week: string;
        month: string;
      };
    };
    diagnostics: {
      title: string;
      description: string;
      errorLoading: string;
      salesRecords: string;
      daysOfHistory: string;
      uniqueProducts: string;
      categories: string;
      itemsSold: string;
      dateRange: string;
      predictionTier: string;
      needMoreData: string;
      basicDescription: string;
      mlDescription: string;
      tiers: {
        none: string;
        basic: string;
        ml: string;
      };
      tooltips: {
        salesRecords: string;
        daysOfHistory: string;
        uniqueProducts: string;
        categories: string;
        itemsSold: string;
        dateRange: string;
      };
    };
  };
  // Add other sections as needed
}

export const translations: Record<TranslationKeys, Translation> = {
  // English translation
  en: {
    // Root level translations
    login: "Login to CashFlow",
    register: "Register for CashFlow",
    email: "Email Address",
    username: "Username",
    firstName: "First Name",
    lastName: "Last Name",
    password: "Password",
    confirmPassword: "Confirm Password",
    signIn: "Sign In",
    signOut: "Sign Out",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember me",
    registerNow: "Don't have an account? Register",
    loginNow: "Already have an account? Login",
    registerButton: "Register",

    app: {
      name: 'CashFlow',
      tagline: 'Business Management System',
      welcome: "Welcome back",
    },
    nav: {
      dashboard: 'Dashboard',
      pos: 'Point of Sale',
      inventory: 'Inventory',
      orders: 'Orders',
      customers: 'Customers',
      invoices: 'Invoices',
      settings: 'Settings',
      help: 'Help',
    },
    common: {
      search: 'Search',
      notifications: 'Notifications',
      noData: 'No data available',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      create: 'Create',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      time: 'Time',
      amount: 'Amount',
      total: 'Total',
      subtotal: 'Subtotal',
      tax: 'Tax',
      discount: 'Discount',
      quantity: 'Quantity',
      price: 'Price',
      name: 'Name',
      description: 'Description',
      category: 'Category',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      markAllAsRead: 'Mark all as read',
      todayAt: 'Today at',
      yesterdayAt: 'Yesterday at',
      discardChanges: undefined,
      discardChangesMessage: undefined,
      discard: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
      notes: undefined,
      product: undefined,
      refresh: 'Refresh',
      retry: 'Try Again',
    },
    userMenu: {
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      switchAccount: "Switch Account"
    },
    // dashboard: {
    //   welcome: 'Welcome',
    //   salesOverview: 'Sales Overview',
    //   topProducts: 'Top Products',
    //   recentOrders: 'Recent Orders',
    //   recentSales: 'Recent Sales',
    // },
    help: {
      title: 'Help Center',
      description: 'Find answers, learn how to use CashFlow, and get support when you need it.',
      tabs: {
        userManual: 'User Manual',
        faq: 'FAQ',
        about: 'About',
        support: 'Support',
      },
      userManual: {
        title: 'User Manual',
        introduction: 'Welcome to the CashFlow user manual. This guide will help you understand how to use all features of the application effectively.',
        sections: {
          dashboard: {
            title: 'Dashboard',
            description: 'The Dashboard provides an overview of your business performance with key metrics and charts.',
            features: {
              salesSummary: {
                title: 'Sales Summary',
                description: 'View daily, weekly, and monthly sales figures with trend analysis.'
              },
              inventoryStatus: {
                title: 'Inventory Status',
                description: 'Quick view of inventory levels and alerts for low stock items.'
              },
              recentOrders: {
                title: 'Recent Orders',
                description: 'List of recent orders with status indicators.'
              }
            }
          },
          pos: {
            title: 'Point of Sale (POS)',
            description: 'The POS screen is where you create sales and process payments.',
            features: {
              productSelection: {
                title: 'Product Selection',
                description: 'Click on products to add them to the cart. Use the search bar to find specific products quickly.'
              },
              customerSelection: {
                title: 'Customer Selection',
                description: 'Search for existing customers or create a new one directly from the POS screen.'
              },
              paymentProcessing: {
                title: 'Payment Processing',
                description: 'Accept multiple payment methods including cash, card, and bank transfers. Apply taxes and discounts as needed.'
              },
              orderCreation: {
                title: 'Order Creation',
                description: 'Create orders for future fulfillment with custom delivery dates.'
              }
            }
          },
          inventory: {
            title: 'Inventory Management',
            description: 'The Inventory section allows you to manage your products and stock levels.',
            features: {
              productManagement: {
                title: 'Product Management',
                description: 'Add, edit, and delete products. Set prices, descriptions, and assign categories.'
              },
              categoryManagement: {
                title: 'Category Management',
                description: 'Create and manage product categories for better organization.'
              },
              stockAdjustments: {
                title: 'Stock Adjustments',
                description: 'Update stock levels manually with reason codes for proper record-keeping.'
              }
            }
          },
          orders: {
            title: 'Orders Management',
            description: 'The Orders section helps you manage all customer orders.',
            features: {
              orderTracking: {
                title: 'Order Tracking',
                description: 'View all orders with status indicators (pending, completed, cancelled).'
              },
              orderDetails: {
                title: 'Order Details',
                description: 'View complete order information including customer details, items, and pricing.'
              },
              orderManagement: {
                title: 'Order Management',
                description: 'Edit delivery dates, complete orders, or cancel orders as needed.'
              }
            }
          },
          customers: {
            title: 'Customer Management',
            description: 'The Customers section allows you to manage your customer database.',
            features: {
              customerDatabase: {
                title: 'Customer Database',
                description: 'View and search all customer records with contact information.'
              },
              customerCreation: {
                title: 'Customer Creation',
                description: 'Add new customers with detailed information including name, contact details, and address.'
              },
              purchaseHistory: {
                title: 'Purchase History',
                description: 'View complete purchase history for each customer with order and sale details.'
              }
            }
          },
          settings: {
            title: 'Settings',
            description: 'The Settings section lets you customize the application to your needs.',
            features: {
              businessSettings: {
                title: 'Business Settings',
                description: 'Configure business information, logo, and contact details.'
              },
              taxSettings: {
                title: 'Tax Settings',
                description: 'Set default tax rates and tax calculation methods.'
              },
              userManagement: {
                title: 'User Management',
                description: 'Add and manage user accounts with different permission levels.'
              }
            }
          }
        }
      },
      faq: {
        title: 'Frequently Asked Questions',
        cantFindQuestion: 'Can\'t find what you\'re looking for?',
        contactSupport: 'Contact Support',
        questions: {
          q1: {
            question: 'How do I create a new sale?',
            answer: 'To create a new sale, navigate to the POS (Point of Sale) section from the sidebar menu. Add products to the cart by clicking on them from the product grid. You can search for specific products using the search bar. Select a customer or create a new one, apply any discounts or taxes, choose a payment method, and click \'Complete Payment\'.'
          },
          q2: {
            question: 'How do I manage inventory?',
            answer: 'Go to the Inventory section from the sidebar. Here you can view all products, add new products, edit existing ones, and manage categories. To add a new product, click the \'Add Product\' button and fill in the required information. To adjust stock levels, use the \'Stock Adjustment\' option available in the product actions menu.'
          },
          q3: {
            question: 'How do I create and manage orders?',
            answer: 'From the POS screen, you can create a new order by adding products to the cart, selecting a customer, and clicking \'Create Order\' instead of completing the payment. To manage existing orders, go to the Orders section where you can view, edit, complete, or cancel orders. Orders can be filtered by status, date range, or search terms.'
          },
          q4: {
            question: 'How do I add a new customer?',
            answer: 'Navigate to the Customers section and click \'Add Customer\'. Fill in the customer details form with the required information such as name, contact information, and address. You can also add customers on-the-fly during the sale process from the POS screen by clicking the customer search field and selecting \'Add New Customer\'.'
          },
          q5: {
            question: 'Can I offer discounts on sales?',
            answer: 'Yes, during the sale process in the POS screen, you can apply a percentage discount in the payment section. This discount will be applied to the entire sale. For specific product discounts, you can adjust the price directly in the product settings.'
          }
        }
      },
      about: {
        title: 'About CashFlow',
        version: 'Version: 1.0.0',
        description: 'CashFlow is a comprehensive point of sale and business management solution designed specifically for small to medium-sized businesses. Our software helps streamline your operations, manage inventory, process sales, and track customer relationships.',
        features: {
          pos: {
            title: 'Point of Sale (POS)',
            description: 'Process sales quickly and efficiently with an intuitive interface. Support for multiple payment methods and discount options.'
          },
          inventory: {
            title: 'Inventory Management',
            description: 'Track stock levels in real-time, set low stock alerts, and manage product categories with ease.'
          },
          orders: {
            title: 'Order Management',
            description: 'Create and track customer orders, manage deliveries, and convert orders to sales with one click.'
          },
          customers: {
            title: 'Customer Management',
            description: 'Build a comprehensive customer database with purchase history, contact details, and custom notes.'
          }
        },
        systemRequirements: {
          title: 'System Requirements',
          requirements: {
            os: 'Operating System: Windows 10/11, macOS 11+, Ubuntu 20.04+',
            browser: 'Browser: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+',
            connection: 'Internet Connection: Broadband connection (1 Mbps or faster)',
            screen: 'Screen Resolution: Minimum 1280x720, Recommended 1920x1080'
          }
        },
        legalInformation: {
          title: 'Legal Information',
          copyright: '© 2025 CashFlow Business Solutions. All rights reserved.',
          termsOfService: 'Terms of Service',
          privacyPolicy: 'Privacy Policy',
          licenseAgreement: 'License Agreement'
        }
      },
      support: {
        title: 'Support Options',
        emailSupport: {
          title: 'Email Support',
          description: 'For general inquiries and non-urgent issues, please contact our support team via email.',
          email: 'support@cashflow.example.com',
          responseTime: 'Response time: 24-48 hours',
          buttonText: 'Send Email'
        },
        liveChat: {
          title: 'Live Chat Support',
          description: 'Get immediate assistance from our support team through live chat during business hours.',
          hours: 'Hours: Monday-Friday, 9:00 AM - 5:00 PM',
          waitTime: 'Average wait time: 5-10 minutes',
          buttonText: 'Start Chat'
        },
        supportTicket: {
          title: 'Submit a Support Ticket',
          description: 'For detailed technical issues or feature requests, please submit a support ticket. Our team will investigate and respond promptly.',
          form: {
            subject: 'Subject',
            description: 'Description',
            email: 'Email',
            submit: 'Submit Ticket'
          }
        },
        commonTopics: {
          title: 'Frequently Requested Support Topics',
          passwordReset: 'Password Reset Instructions',
          networkIssues: 'Troubleshooting Network Connection Issues',
          dataImportExport: 'Data Import/Export Guide',
          printerSetup: 'Setting Up Printers and Hardware'
        }
      }
    },
    theme: {
      light: "Light Mode",
      dark: "Dark Mode",
      system: "System"
    },
    languages: {
      en: "English",
      si: "සිංහල",
      ta: "தமிழ்",
      select: "Select Language"
    },
    pos: {
      title: 'Point of Sale',
      cart: {
        empty: 'Your cart is empty',
        customerSearch: 'Search customer by name, email, or phone',
        customerLabel: 'Customer',
        noCustomersFound: 'No customers found',
        totalItems: 'Total Items',
        each: 'each',
        searchPlaceholder: 'Search products...',
        noProductsFound: 'No products available',
        noProductsMatchSearch: 'No products found matching "{search}"',
        quantity: 'Qty',
        productStatus: {
          outOfStock: 'Out',
          lowStock: 'Low',
          inStock: 'In Stock'
        },
        scanBarcode: ""
      },
      payment: {
        taxAndDiscount: 'Tax & Discount',
        paymentMethods: 'Payment Methods',
        summary: 'Summary',
        tax: 'Tax',
        taxDefault: 'Tax % (Default: {rate}%)',
        discount: 'Discount %',
        deliveryDate: 'Delivery Date',
        cash: 'Cash',
        card: 'Card',
        bankTransfer: 'Bank Transfer',
        subtotal: 'Subtotal',
        total: 'Total',
        remaining: 'Remaining',
        change: 'Change',
        completePayment: 'Complete Payment',
        createOrder: 'Create Order',
        tooltips: {
          addItems: 'Please add items to the cart',
          insufficientPayment: 'Payment amount is insufficient',
          readyToComplete: 'Complete payment',
          selectCustomer: 'Please select a customer',
          readyToOrder: 'Create order'
        }
      },
      alerts: {
        error: {
          emptyCart: 'Cannot complete payment: Cart is empty',
          insufficientPayment: 'Cannot complete payment: Payment amount is insufficient',
          createOrder: 'Cannot create order: Cart is empty',
          noCustomer: 'Cannot create order: No customer selected',
          generic: 'Failed to complete sale',
          orderGeneric: 'Failed to create order'
        },
        success: {
          orderCreated: 'Order created successfully!'
        }
      }
    },
    orders: {
      title: "Orders",
      newOrder: "New Order",
      orderList: "Order List",
      orderDetails: "Order Details",
      editOrder: "Edit Order",
      noOrders: "No orders found",
      itemCount: "{count} items",
      status: {
        all: "All",
        pending: "Pending",
        completed: "Completed",
        cancelled: "Cancelled"
      },
      fields: {
        orderId: "Order ID",
        created: "Created",
        deliveryDate: "Delivery Date",
        customer: "Customer",
        items: "Items",
        subtotal: "Subtotal",
        total: "Total",
        status: "Status",
        actions: "Actions",
        completedDate: undefined,
        saleId: undefined
      },
      filters: {
        search: "Search orders...",
        dateRange: "Date Range",
        allTime: "All Time",
        today: "Today",
        yesterday: "Yesterday",
        thisWeek: "This Week",
        lastWeek: "Last Week",
        thisMonth: "This Month",
        lastMonth: "Last Month"
      },
      actions: {
        view: "View Order",
        edit: "Edit Order",
        complete: "Complete Order",
        cancel: "Cancel Order",
        back: "Back",
        save: "Save",
        saveChanges: "Save Changes",
        saving: "Saving..."
      },
      dialogs: {
        complete: {
          title: "Complete Order",
          message: "Are you sure you want to complete this order? This will create a sale record and update inventory.",
          confirm: "Complete"
        },
        cancel: {
          title: "Cancel Order",
          message: "Are you sure you want to cancel this order? This action cannot be undone.",
          confirm: "Cancel"
        }
      },
      messages: {
        loading: "Loading orders...",
        noData: "No orders found",
        fetchError: "Failed to fetch orders",
        updateSuccess: "Order updated successfully",
        updateError: "Failed to update order",
        completeSuccess: "Order completed successfully",
        completeError: "Failed to complete order",
        cancelSuccess: "Order cancelled successfully",
        cancelError: "Failed to cancel order",
        noCustomerData: undefined
      },
      pricing: {
        title: "Pricing Settings",
        tax: "Tax",
        taxPercentage: "Tax Percentage",
        discount: "Discount",
        discountPercentage: "Discount Percentage"
      },
      orderInfo: {
        title: "Order Information",
        readOnlyItems: "Order Items (Read-only)",
        readOnlyMessage: "To modify items, please cancel the order and create a new one."
      }
    },
    customers: {
      title: "Customers",
      addCustomer: "Add Customer",
      editCustomer: "Edit Customer",
      deleteCustomer: "Delete Customer",
      search: "Search customers...",
      fields: {
        name: "Name",
        email: "Email",
        phone: "Phone",
        address: "Address",
        discountEligible: "Discount Eligible"
      },
      placeholders: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: "123 Main St, City, State, 12345",
        phoneHelp: "Enter 10 digits without spaces or dashes"
      },
      actions: {
        edit: "Edit",
        delete: "Delete",
        add: "Add Customer",
        update: "Update Customer",
        cancel: "Cancel"
      },
      deleteConfirm: {
        title: "Delete Customer",
        message: 'Are you sure you want to delete the customer "{name}"? This action cannot be undone.'
      },
      validation: {
        required: {
          name: "Name is required",
          email: "Email is required"
        },
        invalid: {
          email: "Invalid email format",
          phone: "Phone number must be 10 digits"
        }
      },
      messages: {
        addSuccess: "Customer added successfully",
        updateSuccess: "Customer updated successfully",
        deleteSuccess: "Customer deleted successfully",
        error: {
          fetch: "Failed to fetch customers",
          add: "Failed to add customer",
          update: "Failed to update customer",
          delete: "Failed to delete customer"
        }
      },
      status: {
        yes: "Yes",
        no: "No",
        na: "N/A"
      }
    },
    dashboard: {
      // Keep your existing translations
      welcome: 'Welcome to your Dashboard',
      salesOverview: 'Sales Overview',
      topProducts: 'Top Products',
      recentOrders: 'Recent Orders',
      recentSales: 'Recent Sales',

      // Add these new translations
      title: 'Dashboard',
      description: 'Overview of your business performance and predictions',
      comingSoon: 'Coming soon',
      tabs: {
        overview: 'Overview',
        predictions: 'Sales Predictions',
        reports: 'Reports'
      },
      predictions: {
        title: 'Sales Predictions',
        noPredictions: 'No predictions available',
        dataTooltip: 'Days of historical data used for predictions',
        daysOfData: 'days of data',
        trainModels: 'Train prediction models',
        switchView: 'Switch time period',
        tabs: {
          tomorrow: 'Tomorrow',
          week: 'This Week',
          month: 'This Month'
        }
      },
      diagnostics: {
        title: 'Prediction System',
        description: 'Analysis of your prediction data quality',
        errorLoading: 'Error loading diagnostic information',
        salesRecords: 'Sales Records',
        daysOfHistory: 'Days of History',
        uniqueProducts: 'Products',
        categories: 'Categories',
        itemsSold: 'Items Sold',
        dateRange: 'Date Range',
        predictionTier: 'Prediction System Quality',
        needMoreData: 'Need {days} more days of data for basic predictions',
        basicDescription: 'Using basic statistical model. {days} more days for ML predictions',
        mlDescription: 'Using advanced ML prediction model for highest accuracy',
        tiers: {
          none: 'No Predictions',
          basic: 'Basic',
          ml: 'Advanced ML'
        },
        tooltips: {
          salesRecords: 'Total number of sales transactions in your history',
          daysOfHistory: 'Number of days with sales data available',
          uniqueProducts: 'Number of different products sold',
          categories: 'Number of product categories',
          itemsSold: 'Total quantity of all items sold',
          dateRange: 'Date range of your sales history'
        }
      }
    },
    inventory: undefined
  },

  // Sinhala translation
  si: {
    // Root level translations
    login: "CashFlow වෙත පිවිසෙන්න",
    register: "CashFlow සඳහා ලියාපදිංචි වන්න",
    email: "විද්‍යුත් තැපෑල",
    username: "පරිශීලක නාමය",
    firstName: "මුල් නම",
    lastName: "අවසන් නම",
    password: "මුරපදය",
    confirmPassword: "මුරපදය තහවුරු කරන්න",
    signIn: "පිවිසෙන්න",
    signOut: "පිටවීම",
    forgotPassword: "මුරපදය අමතකද?",
    rememberMe: "මතක තබා ගන්න",
    registerNow: "ගිණුමක් නැද්ද? ලියාපදිංචි වන්න",
    loginNow: "දැනටමත් ගිණුමක් තිබේද? පිවිසෙන්න",
    registerButton: "ලියාපදිංචි වන්න",

    app: {
      name: 'Cashflow',
      tagline: 'ව්‍යාපාර කළමනාකරණ පද්ධතිය',
      welcome: "ආයුබෝවන්",
    },
    nav: {
      dashboard: 'ඩැෂ්බෝඩ්',
      pos: 'විකුණුම් ස්ථානය',
      inventory: 'තොග',
      orders: 'ඇණවුම්',
      customers: 'පාරිභෝගිකයින්',
      invoices: 'ඉන්වොයිස්',
      settings: 'සැකසුම්',
      help: 'උපකාර',
    },
    common: {
      search: 'සොයන්න',
      notifications: 'දැනුම්දීම්',
      noData: 'දත්ත නොමැත',
      loading: 'පූරණය වෙමින්...',
      save: 'සුරකින්න',
      cancel: 'අවලංගු කරන්න',
      edit: 'සංස්කරණය කරන්න',
      delete: 'මකන්න',
      add: 'එකතු කරන්න',
      close: 'වසන්න',
      confirm: 'තහවුරු කරන්න',
      back: 'ආපසු',
      next: 'ඊළඟ',
      create: 'සාදන්න',
      actions: 'ක්‍රියාමාර්ග',
      status: 'තත්ත්වය',
      date: 'දිනය',
      time: 'වේලාව',
      amount: 'මුදල',
      total: 'මුළු එකතුව',
      subtotal: 'උප එකතුව',
      tax: 'බදු',
      discount: 'වට්ටම',
      quantity: 'ප්‍රමාණය',
      price: 'මිල',
      name: 'නම',
      description: 'විස්තරය',
      category: 'කාණ්ඩය',
      success: 'සාර්ථකයි',
      error: 'දෝෂයකි',
      warning: 'අවවාදයයි',
      info: 'තොරතුරු',
      markAllAsRead: 'සියල්ල කියවූ ලෙස සලකුණු කරන්න',
      todayAt: 'අද',
      yesterdayAt: 'ඊයේ',
      discardChanges: undefined,
      discardChangesMessage: undefined,
      discard: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
      notes: undefined,
      product: undefined,
      refresh: 'යළි පූරණය කරන්න',
      retry: 'නැවත උත්සාහ කරන්න',
    },
    userMenu: {
      profile: "පැතිකඩ",
      settings: "සැකසුම්",
      logout: "පිටවීම",
      switchAccount: "ගිණුම මාරු කරන්න"
    },
    // dashboard: {
    //   welcome: 'සාදරයෙන් පිළිගනිමු',
    //   salesOverview: 'විකුණුම් දළ විශ්ලේෂණය',
    //   topProducts: 'හොඳම නිෂ්පාදන',
    //   recentOrders: 'මෑත ඇණවුම්',
    //   recentSales: 'මෑත විකුණුම්',
    //   title: "",
    //   description: "",
    //   comingSoon: "",
    //   tabs: {
    //     overview: "",
    //     predictions: "",
    //     reports: ""
    //   },
    //   predictions: {
    //     title: "",
    //     noPredictions: "",
    //     dataTooltip: "",
    //     daysOfData: "",
    //     trainModels: "",
    //     switchView: "",
    //     tabs: {
    //       tomorrow: "",
    //       week: "",
    //       month: ""
    //     }
    //   },
    //   diagnostics: {
    //     title: "",
    //     description: "",
    //     errorLoading: "",
    //     salesRecords: "",
    //     daysOfHistory: "",
    //     uniqueProducts: "",
    //     categories: "",
    //     itemsSold: "",
    //     dateRange: "",
    //     predictionTier: "",
    //     needMoreData: "",
    //     basicDescription: "",
    //     mlDescription: "",
    //     tiers: {
    //       none: "",
    //       basic: "",
    //       ml: ""
    //     },
    //     tooltips: {
    //       salesRecords: "",
    //       daysOfHistory: "",
    //       uniqueProducts: "",
    //       categories: "",
    //       itemsSold: "",
    //       dateRange: ""
    //     }
    //   }
    // },
    help: {
      title: 'උපකාර මධ්‍යස්ථානය',
      description: 'පිළිතුරු සොයා ගන්න, කැෂ්ෆ්ලෝ භාවිතා කරන ආකාරය ඉගෙන ගන්න, සහ ඔබට අවශ්‍ය විට සහාය ලබා ගන්න.',
      tabs: {
        userManual: 'පරිශීලක අත්පොත',
        faq: 'නිතර අසන ප්‍රශ්න',
        about: 'පිළිබඳව',
        support: 'සහාය',
      },
      userManual: {
        title: 'පරිශීලක අත්පොත',
        introduction: 'කැෂ්ෆ්ලෝ පරිශීලක අත්පොතට සාදරයෙන් පිළිගනිමු. මෙම මාර්ගෝපදේශය යෙදුමේ සියලුම විශේෂාංග ඵලදායී ලෙස භාවිතා කරන ආකාරය තේරුම් ගැනීමට ඔබට උපකාරී වේ.',
        sections: {
          dashboard: {
            title: 'ඩැෂ්බෝඩ්',
            description: 'ඩැෂ්බෝඩ් එක ප්‍රධාන මිනුම් සහ ප්‍රස්තාර සමඟ ඔබේ ව්‍යාපාරයේ කාර්යසාධනය පිළිබඳ දළ විශ්ලේෂණයක් ලබා දෙයි.',
            features: {
              salesSummary: {
                title: 'විකුණුම් සාරාංශය',
                description: 'ප්‍රවණතා විශ්ලේෂණය සමඟ දෛනික, සතිපතා, සහ මාසික විකුණුම් සංඛ්‍යා බලන්න.'
              },
              inventoryStatus: {
                title: 'තොග තත්ත්වය',
                description: 'තොග මට්ටම් සහ අඩු තොග අයිතම සඳහා ඇඟවීම් ඉක්මනින් බලන්න.'
              },
              recentOrders: {
                title: 'මෑත ඇණවුම්',
                description: 'තත්ත්ව දර්ශක සහිත මෑත ඇණවුම් ලැයිස්තුව.'
              }
            }
          },
          pos: {
            title: 'විකුණුම් ස්ථානය (POS)',
            description: 'විකුණුම් ස්ථානය තිරය මගින් ඔබ විකුණුම් සාදා ගෙවීම් සකසන ස්ථානයයි.',
            features: {
              productSelection: {
                title: 'නිෂ්පාදන තේරීම',
                description: 'නිෂ්පාදන මත ක්ලික් කිරීමෙන් ඒවා කූඩයට එකතු කරන්න. නිශ්චිත නිෂ්පාදන ඉක්මනින් සොයා ගැනීමට සෙවුම් තීරුව භාවිතා කරන්න.'
              },
              customerSelection: {
                title: 'පාරිභෝගික තේරීම',
                description: 'පවතින පාරිභෝගිකයින් සොයන්න හෝ විකුණුම් ස්ථානය තිරයෙන් කෙලින්ම නව එකක් සාදන්න.'
              },
              paymentProcessing: {
                title: 'ගෙවීම් සැකසීම',
                description: 'මුදල්, කාඩ්පත්, සහ බැංකු මාරු ඇතුළු බහුවිධ ගෙවීම් ක්‍රම පිළිගන්න. අවශ්‍ය පරිදි බදු සහ වට්ටම් යොදන්න.'
              },
              orderCreation: {
                title: 'ඇණවුම් සෑදීම',
                description: 'අනාගත සැපයීම් සඳහා අභිමත බෙදාහැරීමේ දින සහිත ඇණවුම් සාදන්න.'
              }
            }
          },
          inventory: {
            title: 'තොග කළමනාකරණය',
            description: 'තොග කොටස මගින් ඔබට ඔබේ නිෂ්පාදන සහ තොග මට්ටම් කළමනාකරණය කිරීමට ඉඩ සලසයි.',
            features: {
              productManagement: {
                title: 'නිෂ්පාදන කළමනාකරණය',
                description: 'නිෂ්පාදන එකතු කරන්න, සංස්කරණය කරන්න, සහ මකන්න. මිල, විස්තර, සහ කාණ්ඩ පවරන්න.'
              },
              categoryManagement: {
                title: 'කාණ්ඩ කළමනාකරණය',
                description: 'වඩා හොඳ සංවිධානය සඳහා නිෂ්පාදන කාණ්ඩ සාදන්න සහ කළමනාකරණය කරන්න.'
              },
              stockAdjustments: {
                title: 'තොග ගැලපීම්',
                description: 'නිසි වාර්තා තබා ගැනීම සඳහා හේතු කේත සමඟ අතින් තොග මට්ටම් යාවත්කාලීන කරන්න.'
              }
            }
          },
          orders: {
            title: 'ඇණවුම් කළමනාකරණය',
            description: 'ඇණවුම් කොටස ඔබේ සියලුම පාරිභෝගික ඇණවුම් කළමනාකරණය කිරීමට උපකාරී වේ.',
            features: {
              orderTracking: {
                title: 'ඇණවුම් ලුහුබැඳීම',
                description: 'තත්ත්ව දර්ශක (අපේක්ෂිත, සම්පූර්ණ කරන ලද, අවලංගු කරන ලද) සමඟ සියලුම ඇණවුම් බලන්න.'
              },
              orderDetails: {
                title: 'ඇණවුම් විස්තර',
                description: 'පාරිභෝගික විස්තර, අයිතම, සහ මිල ගණන් ඇතුළුව සම්පූර්ණ ඇණවුම් තොරතුරු බලන්න.'
              },
              orderManagement: {
                title: 'ඇණවුම් කළමනාකරණය',
                description: 'බෙදාහැරීමේ දින සංස්කරණය කරන්න, ඇණවුම් සම්පූර්ණ කරන්න, හෝ අවශ්‍ය පරිදි ඇණවුම් අවලංගු කරන්න.'
              }
            }
          },
          customers: {
            title: 'පාරිභෝගික කළමනාකරණය',
            description: 'පාරිභෝගිකයින් කොටස ඔබට ඔබේ පාරිභෝගික දත්ත සමුදාය කළමනාකරණය කිරීමට ඉඩ සලසයි.',
            features: {
              customerDatabase: {
                title: 'පාරිභෝගික දත්ත සමුදාය',
                description: 'සම්බන්ධතා තොරතුරු සමඟ සියලුම පාරිභෝගික වාර්තා බලන්න සහ සොයන්න.'
              },
              customerCreation: {
                title: 'පාරිභෝගික සෑදීම',
                description: 'නම, සම්බන්ධතා විස්තර, සහ ලිපිනය ඇතුළුව විස්තරාත්මක තොරතුරු සමඟ නව පාරිභෝගිකයින් එකතු කරන්න.'
              },
              purchaseHistory: {
                title: 'මිලදී ගැනීමේ ඉතිහාසය',
                description: 'ඇණවුම් සහ විකුණුම් විස්තර සමඟ එක් එක් පාරිභෝගිකයා සඳහා සම්පූර්ණ මිලදී ගැනීමේ ඉතිහාසය බලන්න.'
              }
            }
          },
          settings: {
            title: 'සැකසුම්',
            description: 'සැකසුම් කොටස ඔබට ඔබේ අවශ්‍යතා සඳහා යෙදුම අභිරුචිකරණය කිරීමට ඉඩ දෙයි.',
            features: {
              businessSettings: {
                title: 'ව්‍යාපාර සැකසුම්',
                description: 'ව්‍යාපාර තොරතුරු, ලාංඡනය, සහ සම්බන්ධතා විස්තර වින්‍යාස කරන්න.'
              },
              taxSettings: {
                title: 'බදු සැකසුම්',
                description: 'පෙරනිමි බදු අනුපාත සහ බදු ගණනය කිරීමේ ක්‍රම සකසන්න.'
              },
              userManagement: {
                title: 'පරිශීලක කළමනාකරණය',
                description: 'විවිධ අවසර මට්ටම් සහිත පරිශීලක ගිණුම් එකතු කරන්න සහ කළමනාකරණය කරන්න.'
              }
            }
          }
        }
      },
      faq: {
        title: 'නිතර අසන ප්‍රශ්න',
        cantFindQuestion: 'ඔබ සොයන දේ සොයා ගත නොහැකිද?',
        contactSupport: 'සහාය අමතන්න',
        questions: {
          q1: {
            question: 'නව විකුණුමක් සෑදීමට කොහොමද?',
            answer: 'නව විකුණුමක් සෑදීමට, පැති තීරු මෙනුවෙන් POS (විකුණුම් ස්ථානය) කොටසට යන්න. නිෂ්පාදන ජාලයෙන් ඒවා මත ක්ලික් කිරීමෙන් නිෂ්පාදන කූඩයට එකතු කරන්න. ඔබට සෙවුම් තීරුව භාවිතයෙන් නිශ්චිත නිෂ්පාදන සෙවිය හැකිය. ගනුදෙනුකරුවෙකු තෝරන්න හෝ නව එකක් සාදන්න, යම් වට්ටම් හෝ බදු යොදන්න, ගෙවීම් ක්‍රමයක් තෝරන්න, සහ \'ගෙවීම සම්පූර්ණ කරන්න\' ක්ලික් කරන්න.'
          },
          q2: {
            question: 'තොග පාලනය කරන්නේ කොහොමද?',
            answer: 'පැති තීරුවෙන් තොග කොටසට යන්න. මෙහිදී ඔබට සියලුම නිෂ්පාදන බැලීමට, නව නිෂ්පාදන එක් කිරීමට, පවතින ඒවා සංස්කරණය කිරීමට සහ කාණ්ඩ කළමනාකරණය කිරීමට හැකිය. නව නිෂ්පාදනයක් එක් කිරීමට, \'නිෂ්පාදනය එක් කරන්න\' බොත්තම ක්ලික් කර අවශ්‍ය තොරතුරු පුරවන්න. තොග මට්ටම් සකස් කිරීමට, නිෂ්පාදන ක්‍රියා මෙනුවේ ඇති \'තොග ගැලපීම\' විකල්පය භාවිතා කරන්න.'
          },
          q3: {
            question: 'ඇණවුම් සෑදීමට සහ කළමනාකරණය කිරීමට කොහොමද?',
            answer: 'POS තිරයෙන්, ඔබට නිෂ්පාදන කූඩයට එකතු කිරීමෙන්, පාරිභෝගිකයෙකු තේරීමෙන්, සහ ගෙවීම සම්පූර්ණ කිරීම වෙනුවට \'ඇණවුම සාදන්න\' ක්ලික් කිරීමෙන් නව ඇණවුමක් සෑදිය හැකිය. පවතින ඇණවුම් කළමනාකරණය කිරීමට, ඇණවුම් කොටසට ගොස් ඔබට ඇණවුම් බැලීමට, සංස්කරණය කිරීමට, සම්පූර්ණ කිරීමට, හෝ අවලංගු කිරීමට හැකිය. ඇණවුම් තත්ත්වය, දින පරාසය, හෝ සෙවුම් වචන අනුව පෙරහන් කළ හැකිය.'
          },
          q4: {
            question: 'නව පාරිභෝගිකයෙකු එකතු කරන්නේ කොහොමද?',
            answer: 'පාරිභෝගිකයින් කොටසට ගොස් \'පාරිභෝගිකයා එක් කරන්න\' ක්ලික් කරන්න. නම, සම්බන්ධතා තොරතුරු, සහ ලිපිනය වැනි අවශ්‍ය තොරතුරු සමඟ පාරිභෝගික විස්තර පෝරමය පුරවන්න. ඔබට POS තිරයේ විකුණුම් ක්‍රියාවලිය අතරතුර පාරිභෝගික සෙවුම් ක්ෂේත්‍රය ක්ලික් කර \'නව පාරිභෝගිකයා එක් කරන්න\' තේරීමෙන් පාරිභෝගිකයින් එකවරම එකතු කළ හැකිය.'
          },
          q5: {
            question: 'විකුණුම් වලට වට්ටම් ලබා දිය හැකිද?',
            answer: 'ඔව්, POS තිරයේ විකුණුම් ක්‍රියාවලිය අතරතුර, ඔබට ගෙවීම් කොටසේ ප්‍රතිශත වට්ටමක් යෙදිය හැකිය. මෙම වට්ටම සම්පූර්ණ විකුණුමට අදාළ වනු ඇත. නිශ්චිත නිෂ්පාදන වට්ටම් සඳහා, ඔබට නිෂ්පාදන සැකසුම් වල මිල කෙලින්ම සකස් කළ හැකිය.'
          }
        }
      },
      about: {
        title: 'කැෂ්ෆ්ලෝ පිළිබඳව',
        version: 'අනුවාදය: 1.0.0',
        description: 'කැෂ්ෆ්ලෝ යනු කුඩා සිට මධ්‍යම ප්‍රමාණයේ ව්‍යාපාර සඳහා විශේෂයෙන් නිර්මාණය කරන ලද විස්තීර්ණ විකුණුම් ස්ථාන සහ ව්‍යාපාර කළමනාකරණ විසඳුමකි. අපගේ මෘදුකාංගය ඔබේ මෙහෙයුම් සරල කිරීමට, තොග කළමනාකරණය කිරීමට, විකුණුම් සැකසීමට, සහ පාරිභෝගික සබඳතා ලුහුබැඳීමට උපකාරී වේ.',
        features: {
          pos: {
            title: 'විකුණුම් ස්ථානය (POS)',
            description: 'පහසුවෙන් තේරුම් ගත හැකි අතුරු මුහුණතක් සමඟ විකුණුම් ඉක්මනින් සහ කාර්යක්ෂමව සකසන්න. බහුවිධ ගෙවීම් ක්‍රම සහ වට්ටම් විකල්ප සඳහා සහාය.'
          },
          inventory: {
            title: 'තොග කළමනාකරණය',
            description: 'තථ්‍ය කාලයේ තොග මට්ටම් ලුහුබඳින්න, අඩු තොග ඇඟවීම් සකසන්න, සහ පහසුවෙන් නිෂ්පාදන කාණ්ඩ කළමනාකරණය කරන්න.'
          },
          orders: {
            title: 'ඇණවුම් කළමනාකරණය',
            description: 'පාරිභෝගික ඇණවුම් සාදන්න සහ ලුහුබඳින්න, බෙදාහැරීම් කළමනාකරණය කරන්න, සහ එක් ක්ලික් කිරීමකින් ඇණවුම් විකුණුම් බවට පරිවර්තනය කරන්න.'
          },
          customers: {
            title: 'පාරිභෝගික කළමනාකරණය',
            description: 'මිලදී ගැනීමේ ඉතිහාසය, සම්බන්ධතා විස්තර, සහ අභිරුචි සටහන් සමඟ විස්තීර්ණ පාරිභෝගික දත්ත සමුදායක් ගොඩනගන්න.'
          }
        },
        systemRequirements: {
          title: 'පද්ධති අවශ්‍යතා',
          requirements: {
            os: 'මෙහෙයුම් පද්ධතිය: Windows 10/11, macOS 11+, Ubuntu 20.04+',
            browser: 'බ්‍රවුසරය: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+',
            connection: 'අන්තර්ජාල සම්බන්ධතාව: පුළුල්කලාප සම්බන්ධතාව (1 Mbps හෝ වේගවත්)',
            screen: 'තිර විභේදනය: අවම 1280x720, නිර්දේශිත 1920x1080'
          }
        },
        legalInformation: {
          title: 'නීතිමය තොරතුරු',
          copyright: '© 2025 කැෂ්ෆ්ලෝ ව්‍යාපාර විසඳුම්. සියලුම හිමිකම් ඇවිරිණි.',
          termsOfService: 'සේවා නියමයන්',
          privacyPolicy: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය',
          licenseAgreement: 'බලපත්‍ර ගිවිසුම'
        }
      },
      support: {
        title: 'සහාය විකල්ප',
        emailSupport: {
          title: 'ඊමේල් සහාය',
          description: 'සාමාන්‍ය විමසීම් සහ හදිසි නොවන ගැටලු සඳහා, කරුණාකර අපගේ සහාය කණ්ඩායම ඊමේල් හරහා සම්බන්ධ කරගන්න.',
          email: 'support@cashflow.example.com',
          responseTime: 'ප්‍රතිචාර කාලය: පැය 24-48',
          buttonText: 'ඊමේල් යවන්න'
        },
        liveChat: {
          title: 'සජීවී කතාබස් සහාය',
          description: 'ව්‍යාපාරික වේලාවන් තුළ අපගේ සහාය කණ්ඩායමෙන් වහාම සහාය ලබා ගන්න.',
          hours: 'වේලාවන්: සඳුදා-සිකුරාදා, පෙ.ව. 9:00 - ප.ව. 5:00',
          waitTime: 'සාමාන්‍ය රැඳී සිටීමේ කාලය: මිනිත්තු 5-10',
          buttonText: 'කතාබස් ආරම්භ කරන්න'
        },
        supportTicket: {
          title: 'සහාය ටිකට් එකක් ඉදිරිපත් කරන්න',
          description: 'විස්තරාත්මක තාක්ෂණික ගැටලු හෝ විශේෂාංග ඉල්ලීම් සඳහා, කරුණාකර සහාය ටිකට් එකක් ඉදිරිපත් කරන්න. අපගේ කණ්ඩායම විමර්ශනය කර ඉක්මනින් ප්‍රතිචාර දක්වනු ඇත.',
          form: {
            subject: 'මාතෘකාව',
            description: 'විස්තරය',
            email: 'ඊමේල්',
            submit: 'ටිකට් එක ඉදිරිපත් කරන්න'
          }
        },
        commonTopics: {
          title: 'නිතර ඉල්ලුම් කරන සහාය මාතෘකා',
          passwordReset: 'මුරපදය යළි සැකසීමේ උපදෙස්',
          networkIssues: 'ජාල සම්බන්ධතා ගැටලු විසඳීම',
          dataImportExport: 'දත්ත ආනයනය/අපනයනය මාර්ගෝපදේශය',
          printerSetup: 'මුද්‍රණ යන්ත්‍ර සහ දෘඩාංග සැකසීම'
        }
      }
    },
    theme: {
      light: "ආලෝක මාදිලිය",
      dark: "අඳුරු මාදිලිය",
      system: "පද්ධති මාදිලිය"
    },
    languages: {
      en: "English",
      si: "සිංහල",
      ta: "தமிழ்",
      select: "භාෂාව තෝරන්න"
    },
    pos: {
      title: 'විකුණුම් ස්ථානය',
      cart: {
        empty: 'ඔබගේ ඇණවුම් භාණ්ඩ හිස්ය',
        customerSearch: 'නම, විද්‍යුත් තැපෑල, හෝ දුරකථන අංකය මගින් පාරිභෝගිකයා සොයන්න',
        customerLabel: 'පාරිභෝගික',
        noCustomersFound: 'පාරිභෝගිකයන් හමු නොවීය',
        totalItems: 'මුළු අයිතම',
        each: 'එකක්',
        searchPlaceholder: 'භාණ්ඩ සොයන්න...',
        noProductsFound: 'භාණ්ඩ නොමැත',
        noProductsMatchSearch: '"{search}" සමඟ ගැලපෙන භාණ්ඩ හමු නොවීය',
        quantity: 'ප්‍රමාණය',
        productStatus: {
          outOfStock: 'නැත',
          lowStock: 'අඩුයි',
          inStock: 'ඇත'
        },
        scanBarcode: ""
      },
      payment: {
        taxAndDiscount: 'බදු සහ වට්ටම්',
        paymentMethods: 'ගෙවීම් ක්‍රම',
        summary: 'සාරාංශය',
        tax: 'බදු',
        taxDefault: 'බදු % (පෙරනිමි: {rate}%)',
        discount: 'වට්ටම් %',
        deliveryDate: 'බෙදාහැරීමේ දිනය',
        cash: 'මුදල්',
        card: 'කාඩ්පත',
        bankTransfer: 'බැංකු මාරුව',
        subtotal: 'උප එකතුව',
        total: 'මුළු එකතුව',
        remaining: 'ඉතිරිය',
        change: 'ඉතිරි මුදල',
        completePayment: 'ගෙවීම සම්පූර්ණයි',
        createOrder: 'ඇණවුම සාදන්න',
        tooltips: {
          addItems: 'කරුණාකර කරත්තයට භාණ්ඩ එකතු කරන්න',
          insufficientPayment: 'ගෙවීම් මුදල ප්‍රමාණවත් නැත',
          readyToComplete: 'ගෙවීම සම්පූර්ණ කරන්න',
          selectCustomer: 'කරුණාකර පාරිභෝගිකයෙකු තෝරන්න',
          readyToOrder: 'ඇණවුම සාදන්න'
        }
      },
      alerts: {
        error: {
          emptyCart: 'ගෙවීම සම්පූර්ණ කළ නොහැක: කරත්තය හිස්ය',
          insufficientPayment: 'ගෙවීම සම්පූර්ණ කළ නොහැක: ගෙවීම් මුදල ප්‍රමාණවත් නැත',
          createOrder: 'ඇණවුම සෑදිය නොහැක: කරත්තය හිස්ය',
          noCustomer: 'ඇණවුම සෑදිය නොහැක: පාරිභෝගිකයෙකු තෝරා නැත',
          generic: 'විකුණුම සම්පූර්ණ කිරීමට අසමත් විය',
          orderGeneric: 'ඇණවුම සෑදීමට අසමත් විය'
        },
        success: {
          orderCreated: 'ඇණවුම සාර්ථකව සාදන ලදී!'
        }
      }
    },
    orders: {
      title: "ඇණවුම්",
      newOrder: "නව ඇණවුමක්",
      orderList: "ඇණවුම් ලැයිස්තුව",
      orderDetails: "ඇණවුම් විස්තර",
      editOrder: "ඇණවුම සංස්කරණය කරන්න",
      noOrders: "ඇණවුම් නොමැත",
      itemCount: "අයිතම {count}",
      status: {
        all: "සියල්ල",
        pending: "අපේක්ෂිත",
        completed: "සම්පූර්ණ කළ",
        cancelled: "අවලංගු කළ"
      },
      fields: {
        orderId: "ඇණවුම් අංකය",
        created: "සාදන ලද",
        deliveryDate: "බෙදාහැරීමේ දිනය",
        customer: "පාරිභෝගික",
        items: "අයිතම",
        subtotal: "උප එකතුව",
        total: "මුළු එකතුව",
        status: "තත්ත්වය",
        actions: "ක්‍රියාමාර්ග",
        completedDate: undefined,
        saleId: undefined
      },
      filters: {
        search: "ඇණවුම් සොයන්න...",
        dateRange: "කාල සීමාව",
        allTime: "සියලු කාලය",
        today: "අද",
        yesterday: "ඊයේ",
        thisWeek: "මෙම සතිය",
        lastWeek: "පසුගිය සතිය",
        thisMonth: "මෙම මාසය",
        lastMonth: "පසුගිය මාසය"
      },
      actions: {
        view: "බලන්න",
        edit: "සංස්කරණය කරන්න",
        complete: "සම්පූර්ණ කරන්න",
        cancel: "අවලංගු කරන්න",
        back: "ආපසු",
        save: "සුරකින්න",
        saveChanges: "වෙනස්කම් සුරකින්න",
        saving: "සුරකිමින්..."
      },
      dialogs: {
        complete: {
          title: "ඇණවුම සම්පූර්ණ කරන්න",
          message: "ඔබට මෙම ඇණවුම සම්පූර්ණ කිරීමට අවශ්‍ය බව විශ්වාසද? මෙය විකුණුම් වාර්තාවක් සාදා තොග යාවත්කාලීන කරයි.",
          confirm: "සම්පූර්ණ කරන්න"
        },
        cancel: {
          title: "ඇණවුම අවලංගු කරන්න",
          message: "ඔබට මෙම ඇණවුම අවලංගු කිරීමට අවශ්‍ය බව විශ්වාසද? මෙම ක්‍රියාව පසුව වෙනස් කළ නොහැක.",
          confirm: "අවලංගු කරන්න"
        }
      },
      messages: {
        loading: "ඇණවුම් පූරණය වෙමින්...",
        noData: "ඇණවුම් නොමැත",
        fetchError: "ඇණවුම් ලබා ගැනීමට අසමත් විය",
        updateSuccess: "ඇණවුම සාර්ථකව යාවත්කාලීන කරන ලදී",
        updateError: "ඇණවුම යාවත්කාලීන කිරීමට අසමත් විය",
        completeSuccess: "ඇණවුම සාර්ථකව සම්පූර්ණ කරන ලදී",
        completeError: "ඇණවුම සම්පූර්ණ කිරීමට අසමත් විය",
        cancelSuccess: "ඇණවුම සාර්ථකව අවලංගු කරන ලදී",
        cancelError: "ඇණවුම අවලංගු කිරීමට අසමත් විය",
        noCustomerData: undefined
      },
      pricing: {
        title: "මිල සැකසුම්",
        tax: "බදු",
        taxPercentage: "බදු ප්‍රතිශතය",
        discount: "වට්ටම",
        discountPercentage: "වට්ටම් ප්‍රතිශතය"
      },
      orderInfo: {
        title: "ඇණවුම් තොරතුරු",
        readOnlyItems: "ඇණවුම් අයිතම (කියවීම පමණි)",
        readOnlyMessage: "අයිතම වෙනස් කිරීමට, කරුණාකර ඇණවුම අවලංගු කර නව එකක් සාදන්න."
      }
    },
    customers: {
      title: "පාරිභෝගිකයින්",
      addCustomer: "පාරිභෝගිකයෙකු එකතු කරන්න",
      editCustomer: "පාරිභෝගිකයා සංස්කරණය කරන්න",
      deleteCustomer: "පාරිභෝගිකයා මකන්න",
      search: "පාරිභෝගිකයින් සොයන්න...",
      fields: {
        name: "නම",
        email: "විද්‍යුත් තැපෑල",
        phone: "දුරකථන අංකය",
        address: "ලිපිනය",
        discountEligible: "වට්ටම් සුදුසුකම්"
      },
      placeholders: {
        name: "ජෝන් ඩෝ",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: "123 ප්‍රධාන වීදිය, නගරය, ප්‍රාන්තය, 12345",
        phoneHelp: "හිඩැස් හෝ ඉරි නොමැතිව ඉලක්කම් 10ක් ඇතුලත් කරන්න"
      },
      actions: {
        edit: "සංස්කරණය කරන්න",
        delete: "මකන්න",
        add: "පාරිභෝගිකයා එකතු කරන්න",
        update: "පාරිභෝගිකයා යාවත්කාලීන කරන්න",
        cancel: "අවලංගු කරන්න"
      },
      deleteConfirm: {
        title: "පාරිභෝගිකයා මකන්න",
        message: 'ඔබට "{name}" පාරිභෝගිකයා මැකීමට අවශ්‍ය බව විශ්වාසද? මෙම ක්‍රියාව පසුව වෙනස් කළ නොහැක.'
      },
      validation: {
        required: {
          name: "නම අවශ්‍යයි",
          email: "විද්‍යුත් තැපෑල අවශ්‍යයි"
        },
        invalid: {
          email: "වලංගු නොවන විද්‍යුත් තැපැල් ආකෘතිය",
          phone: "දුරකථන අංකය ඉලක්කම් 10ක් විය යුතුය"
        }
      },
      messages: {
        addSuccess: "පාරිභෝගිකයා සාර්ථකව එක් කරන ලදී",
        updateSuccess: "පාරිභෝගිකයා සාර්ථකව යාවත්කාලීන කරන ලදී",
        deleteSuccess: "පාරිභෝගිකයා සාර්ථකව මකා දමන ලදී",
        error: {
          fetch: "පාරිභෝගිකයින් ලබා ගැනීමට අසමත් විය",
          add: "පාරිභෝගිකයා එකතු කිරීමට අසමත් විය",
          update: "පාරිභෝගිකයා යාවත්කාලීන කිරීමට අසමත් විය",
          delete: "පාරිභෝගිකයා මැකීමට අසමත් විය"
        }
      },
      status: {
        yes: "ඔව්",
        no: "නැත",
        na: "නැත"
      }
    },
    dashboard: {
      // Keep your existing translations if any
      welcome: 'ඔබගේ ඩැෂ්බෝඩ් වෙත සාදරයෙන් පිළිගනිමු',
      salesOverview: 'විකුණුම් දළ විශ්ලේෂණය',
      topProducts: 'ප්‍රමුඛ නිෂ්පාදන',
      recentOrders: 'මෑත ඇණවුම්',
      recentSales: 'මෑත විකුණුම්',

      // Add these new translations
      description: 'ඔබගේ ව්‍යාපාර කාර්යසාධනය සහ අනාවැකි දළ විශ්ලේෂණය',
      comingSoon: 'ඉක්මනින් එළැඹෙයි',
      tabs: {
        overview: 'සමස්ත දර්ශනය',
        predictions: 'විකුණුම් අනාවැකි',
        reports: 'වාර්තා'
      },
      predictions: {
        title: 'විකුණුම් අනාවැකි',
        noPredictions: 'අනාවැකි නොමැත',
        dataTooltip: 'අනාවැකි සඳහා භාවිතා කරන ඓතිහාසික දත්ත දින ගණන',
        daysOfData: 'දත්ත දින',
        trainModels: 'අනාවැකි ආකෘති පුහුණු කරන්න',
        switchView: 'කාල සීමාව මාරු කරන්න',
        tabs: {
          tomorrow: 'හෙට',
          week: 'මෙම සතිය',
          month: 'මෙම මාසය'
        }
      },
      diagnostics: {
        title: 'අනාවැකි පද්ධතිය',
        description: 'ඔබගේ අනාවැකි දත්ත තත්ත්ව විශ්ලේෂණය',
        errorLoading: 'රෝග විනිශ්චය තොරතුරු පූරණය කිරීමේ දෝෂයකි',
        salesRecords: 'විකුණුම් වාර්තා',
        daysOfHistory: 'ඉතිහාස දින',
        uniqueProducts: 'නිෂ්පාදන',
        categories: 'කාණ්ඩ',
        itemsSold: 'විකුණා ඇති අයිතම',
        dateRange: 'දින පරාසය',
        predictionTier: 'අනාවැකි පද්ධති ගුණාත්මක භාවය',
        needMoreData: 'මූලික අනාවැකි සඳහා තවත් දින {days}ක් අවශ්‍යයි',
        basicDescription: 'මූලික සංඛ්‍යාත්මක ආකෘතිය භාවිතා කරමින්. ML අනාවැකි සඳහා තවත් දින {days}ක්',
        mlDescription: 'ඉහළම නිරවද්‍යතාව සඳහා උසස් ML අනාවැකි ආකෘතිය භාවිතා කරයි',
        tiers: {
          none: 'අනාවැකි නැත',
          basic: 'මූලික',
          ml: 'උසස් ML'
        },
        tooltips: {
          salesRecords: 'ඔබගේ ඉතිහාසයේ මුළු විකුණුම් ගනුදෙනු ගණන',
          daysOfHistory: 'විකුණුම් දත්ත ඇති දින ගණන',
          uniqueProducts: 'විකුණා ඇති විවිධ නිෂ්පාදන ගණන',
          categories: 'නිෂ්පාදන කාණ්ඩ ගණන',
          itemsSold: 'විකුණා ඇති සියලුම අයිතම ප්‍රමාණය',
          dateRange: 'ඔබගේ විකුණුම් ඉතිහාසයේ දින පරාසය'
        }
      },
      title: ""
    }
    // Add other sections as needed
    ,
    inventory: undefined
  },

  // Tamil translation
  ta: {
    // Root level translations
    login: "CashFlow இல் உள்நுழைக",
    register: "CashFlow இல் பதிவு செய்க",
    email: "மின்னஞ்சல் முகவரி",
    username: "பயனர்பெயர்",
    firstName: "முதல் பெயர்",
    lastName: "கடைசி பெயர்",
    password: "கடவுச்சொல்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    signIn: "உள்நுழைக",
    signOut: "வெளியேறு",
    forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
    rememberMe: "நினைவில் கொள்க",
    registerNow: "கணக்கு இல்லையா? பதிவு செய்க",
    loginNow: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக",
    registerButton: "பதிவு செய்க",

    app: {
      name: 'CashFlow',
      tagline: 'வணிக மேலாண்மை முறை',
      welcome: "மீண்டும் வரவேற்கிறோம்",
    },
    nav: {
      dashboard: 'டாஷ்போர்டு',
      pos: 'விற்பனை நிலையம்',
      inventory: 'சரக்கு',
      orders: 'ஆர்டர்கள்',
      customers: 'வாடிக்கையாளர்கள்',
      invoices: 'இன்வாய்ஸ்கள்',
      settings: 'அமைப்புகள்',
      help: 'உதவி',
    },
    common: {
      search: 'தேடு',
      notifications: 'அறிவிப்புகள்',
      noData: 'தரவு இல்லை',
      loading: 'ஏற்றுகிறது...',
      save: 'சேமி',
      cancel: 'ரத்து செய்',
      edit: 'திருத்து',
      delete: 'நீக்கு',
      add: 'சேர்',
      close: 'மூடு',
      confirm: 'உறுதிப்படுத்து',
      back: 'பின்',
      next: 'அடுத்து',
      create: 'உருவாக்கு',
      actions: 'செயல்கள்',
      status: 'நிலை',
      date: 'தேதி',
      time: 'நேரம்',
      amount: 'தொகை',
      total: 'மொத்தம்',
      subtotal: 'துணை மொத்தம்',
      tax: 'வரி',
      discount: 'தள்ளுபடி',
      quantity: 'அளவு',
      price: 'விலை',
      name: 'பெயர்',
      description: 'விளக்கம்',
      category: 'வகை',
      success: 'வெற்றி',
      error: 'பிழை',
      warning: 'எச்சரிக்கை',
      info: 'தகவல்',
      markAllAsRead: 'அனைத்தையும் படித்ததாக குறி',
      todayAt: 'இன்று',
      yesterdayAt: 'நேற்று',
      discardChanges: undefined,
      discardChangesMessage: undefined,
      discard: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
      notes: undefined,
      product: undefined,
      refresh: 'புதுப்பிக்கவும்',
      retry: 'மீண்டும் முயற்சிக்கவும்'
    },
    userMenu: {
      profile: "சுயவிவரம்",
      settings: "அமைப்புகள்",
      logout: "வெளியேறு",
      switchAccount: "கணக்கை மாற்று"
    },
    // dashboard: {
    //   welcome: 'வரவேற்கிறோம்',
    //   salesOverview: 'விற்பனை மேலோட்டம்',
    //   topProducts: 'சிறந்த தயாரிப்புகள்',
    //   recentOrders: 'சமீபத்திய ஆர்டர்கள்',
    //   recentSales: 'சமீபத்திய விற்பனைகள்',
    // },
    help: {
      title: 'உதவி மையம்',
      description: 'பதில்களைக் கண்டறிய, கேஷ்ஃப்ளோவைப் பயன்படுத்துவது எப்படி என்பதைக் கற்றுக்கொள்ள, மற்றும் தேவைப்படும்போது ஆதரவைப் பெறுங்கள்.',
      tabs: {
        userManual: 'பயனர் கையேடு',
        faq: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
        about: 'பற்றி',
        support: 'ஆதரவு',
      },
      userManual: {
        title: 'பயனர் கையேடு',
        introduction: 'கேஷ்ஃப்ளோ பயனர் கையேட்டிற்கு வரவேற்கிறோம். பயன்பாட்டின் அனைத்து அம்சங்களையும் திறம்பட பயன்படுத்துவது எப்படி என்பதைப் புரிந்துகொள்ள இந்த வழிகாட்டி உங்களுக்கு உதவும்.',
        sections: {
          dashboard: {
            title: 'டாஷ்போர்டு',
            description: 'டாஷ்போர்டு முக்கிய அளவீடுகள் மற்றும் விளக்கப்படங்களுடன் உங்கள் வணிக செயல்திறனின் கண்ணோட்டத்தை வழங்குகிறது.',
            features: {
              salesSummary: {
                title: 'விற்பனை சுருக்கம்',
                description: 'போக்கு பகுப்பாய்வுடன் தினசரி, வாராந்திர மற்றும் மாதாந்திர விற்பனை புள்ளிவிவரங்களைக் காண்க.'
              },
              inventoryStatus: {
                title: 'சரக்கு நிலை',
                description: 'சரக்கு நிலைகள் மற்றும் குறைந்த சரக்கு பொருட்களுக்கான எச்சரிக்கைகளை விரைவாகக் காண்க.'
              },
              recentOrders: {
                title: 'சமீபத்திய ஆர்டர்கள்',
                description: 'நிலை குறிகாட்டிகளுடன் சமீபத்திய ஆர்டர்கள் பட்டியல்.'
              }
            }
          },
          pos: {
            title: 'விற்பனை நிலையம் (POS)',
            description: 'விற்பனை நிலையத் திரை நீங்கள் விற்பனைகளை உருவாக்கி கட்டணங்களைச் செயலாக்கும் இடமாகும்.',
            features: {
              productSelection: {
                title: 'தயாரிப்பு தேர்வு',
                description: 'தயாரிப்புகளைக் கிளிக் செய்வதன் மூலம் அவற்றைக் கூடைக்குச் சேர்க்கவும். குறிப்பிட்ட தயாரிப்புகளை விரைவாகக் கண்டறிய தேடல் பட்டியைப் பயன்படுத்தவும்.'
              },
              customerSelection: {
                title: 'வாடிக்கையாளர் தேர்வு',
                description: 'POS திரையில் இருந்து நேரடியாக உள்ள வாடிக்கையாளர்களைத் தேடவும் அல்லது புதியதை உருவாக்கவும்.'
              },
              paymentProcessing: {
                title: 'கட்டண செயலாக்கம்',
                description: 'பணம், அட்டை மற்றும் வங்கி பரிமாற்றங்கள் உள்ளிட்ட பல கட்டண முறைகளை ஏற்றுக்கொள்ளுங்கள். தேவைப்படும்போது வரிகள் மற்றும் தள்ளுபடிகளைப் பயன்படுத்தவும்.'
              },
              orderCreation: {
                title: 'ஆர்டர் உருவாக்கம்',
                description: 'தனிப்பயன் விநியோக தேதிகளுடன் எதிர்கால நிறைவேற்றலுக்கான ஆர்டர்களை உருவாக்கவும்.'
              }
            }
          },
          inventory: {
            title: 'சரக்கு மேலாண்மை',
            description: 'சரக்கு பிரிவு உங்கள் தயாரிப்புகள் மற்றும் சரக்கு நிலைகளை நிர்வகிக்க உதவுகிறது.',
            features: {
              productManagement: {
                title: 'தயாரிப்பு மேலாண்மை',
                description: 'தயாரிப்புகளைச் சேர்க்கவும், திருத்தவும் மற்றும் நீக்கவும். விலைகள், விளக்கங்களை அமைத்து, வகைகளை ஒதுக்கவும்.'
              },
              categoryManagement: {
                title: 'வகை மேலாண்மை',
                description: 'சிறந்த அமைப்புக்காக தயாரிப்பு வகைகளை உருவாக்கி நிர்வகிக்கவும்.'
              },
              stockAdjustments: {
                title: 'சரக்கு சரிசெய்தல்',
                description: 'சரியான பதிவுகளை வைத்திருக்க காரணக் குறியீடுகளுடன் கைமுறையாக சரக்கு நிலைகளைப் புதுப்பிக்கவும்.'
              }
            }
          },
          orders: {
            title: 'ஆர்டர் மேலாண்மை',
            description: 'ஆர்டர்கள் பிரிவு அனைத்து வாடிக்கையாளர் ஆர்டர்களையும் நிர்வகிக்க உதவுகிறது.',
            features: {
              orderTracking: {
                title: 'ஆர்டர் கண்காணிப்பு',
                description: 'நிலை குறிகாட்டிகளுடன் அனைத்து ஆர்டர்களையும் காண்க (நிலுவையில், நிறைவுசெய்யப்பட்டது, ரத்துசெய்யப்பட்டது).'
              },
              orderDetails: {
                title: 'ஆர்டர் விவரங்கள்',
                description: 'வாடிக்கையாளர் விவரங்கள், பொருட்கள் மற்றும் விலை விவரங்கள் உள்ளிட்ட முழுமையான ஆர்டர் தகவல்களைக் காண்க.'
              },
              orderManagement: {
                title: 'ஆர்டர் மேலாண்மை',
                description: 'விநியோக தேதிகளைத் திருத்தவும், ஆர்டர்களை நிறைவுசெய்யவும் அல்லது தேவைப்படும்போது ஆர்டர்களை ரத்துசெய்யவும்.'
              }
            }
          },
          customers: {
            title: 'வாடிக்கையாளர் மேலாண்மை',
            description: 'வாடிக்கையாளர்கள் பிரிவு உங்கள் வாடிக்கையாளர் தரவுத்தளத்தை நிர்வகிக்க அனுமதிக்கிறது.',
            features: {
              customerDatabase: {
                title: 'வாடிக்கையாளர் தரவுத்தளம்',
                description: 'தொடர்பு தகவலுடன் அனைத்து வாடிக்கையாளர் பதிவுகளையும் பார்த்து தேடவும்.'
              },
              customerCreation: {
                title: 'வாடிக்கையாளர் உருவாக்கம்',
                description: 'பெயர், தொடர்பு விவரங்கள், மற்றும் முகவரி உள்ளிட்ட விரிவான தகவலுடன் புதிய வாடிக்கையாளர்களைச் சேர்க்கவும்.'
              },
              purchaseHistory: {
                title: 'கொள்முதல் வரலாறு',
                description: 'ஆர்டர் மற்றும் விற்பனை விவரங்களுடன் ஒவ்வொரு வாடிக்கையாளருக்கும் முழுமையான கொள்முதல் வரலாற்றைக் காண்க.'
              }
            }
          },
          settings: {
            title: 'அமைப்புகள்',
            description: 'அமைப்புகள் பிரிவு உங்கள் தேவைகளுக்கு ஏற்ப பயன்பாட்டை தனிப்பயனாக்க அனுமதிக்கிறது.',
            features: {
              businessSettings: {
                title: 'வணிக அமைப்புகள்',
                description: 'வணிக தகவல், லோகோ, மற்றும் தொடர்பு விவரங்களை கட்டமைக்கவும்.'
              },
              taxSettings: {
                title: 'வரி அமைப்புகள்',
                description: 'இயல்புநிலை வரி விகிதங்கள் மற்றும் வரி கணக்கீட்டு முறைகளை அமைக்கவும்.'
              },
              userManagement: {
                title: 'பயனர் மேலாண்மை',
                description: 'வெவ்வேறு அனுமதி நிலைகளுடன் பயனர் கணக்குகளைச் சேர்த்து நிர்வகிக்கவும்.'
              }
            }
          }
        }
      },
      faq: {
        title: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
        cantFindQuestion: 'நீங்கள் தேடுவதைக் கண்டறிய முடியவில்லையா?',
        contactSupport: 'ஆதரவைத் தொடர்புகொள்ளவும்',
        questions: {
          q1: {
            question: 'புதிய விற்பனையை எவ்வாறு உருவாக்குவது?',
            answer: 'புதிய விற்பனையை உருவாக்க, பக்கப்பட்டி மெனுவிலிருந்து POS (விற்பனை நிலையம்) பிரிவுக்குச் செல்லவும். தயாரிப்பு கட்டத்திலிருந்து அவற்றைக் கிளிக் செய்வதன் மூலம் தயாரிப்புகளை கார்ட்டில் சேர்க்கவும். தேடல் பட்டியைப் பயன்படுத்தி குறிப்பிட்ட தயாரிப்புகளைத் தேடலாம். ஒரு வாடிக்கையாளரைத் தேர்ந்தெடுக்கவும் அல்லது புதியதை உருவாக்கவும், தள்ளுபடிகள் அல்லது வரிகளைப் பயன்படுத்தவும், கட்டண முறையைத் தேர்ந்தெடுத்து, \'கட்டணத்தை முடிக்கவும்\' என்பதைக் கிளிக் செய்யவும்.'
          },
          q2: {
            question: 'சரக்குகளை எவ்வாறு நிர்வகிப்பது?',
            answer: 'பக்கப்பட்டியிலிருந்து சரக்கு பிரிவுக்குச் செல்லவும். இங்கே நீங்கள் அனைத்து தயாரிப்புகளையும் பார்க்கலாம், புதிய தயாரிப்புகளைச் சேர்க்கலாம், ஏற்கனவே உள்ளவற்றைத் திருத்தலாம் மற்றும் வகைகளை நிர்வகிக்கலாம். புதிய தயாரிப்பைச் சேர்க்க, \'தயாரிப்பைச் சேர்\' பொத்தானைக் கிளிக் செய்து தேவையான தகவல்களை நிரப்பவும். இருப்பு அளவுகளைச் சரிசெய்ய, தயாரிப்பு செயல்கள் மெனுவில் உள்ள \'இருப்பு சரிசெய்தல்\' விருப்பத்தைப் பயன்படுத்தவும்.'
          },
          q3: {
            question: 'ஆர்டர்களை எவ்வாறு உருவாக்கி நிர்வகிப்பது?',
            answer: 'POS திரையிலிருந்து, தயாரிப்புகளை கூடைக்குச் சேர்ப்பதன் மூலமும், ஒரு வாடிக்கையாளரைத் தேர்ந்தெடுப்பதன் மூலமும், கட்டணத்தை முடிப்பதற்குப் பதிலாக \'ஆர்டர் உருவாக்கு\' என்பதைக் கிளிக் செய்வதன் மூலமும் புதிய ஆர்டரை உருவாக்கலாம். ஏற்கனவே உள்ள ஆர்டர்களை நிர்வகிக்க, ஆர்டர்கள் பிரிவுக்குச் செல்லவும், அங்கு நீங்கள் ஆர்டர்களைப் பார்க்கலாம், திருத்தலாம், நிறைவு செய்யலாம் அல்லது ரத்து செய்யலாம். ஆர்டர்களை நிலை, தேதி வரம்பு அல்லது தேடல் சொற்களால் வடிகட்டலாம்.'
          },
          q4: {
            question: 'புதிய வாடிக்கையாளரை எவ்வாறு சேர்ப்பது?',
            answer: 'வாடிக்கையாளர்கள் பிரிவுக்குச் சென்று \'வாடிக்கையாளரைச் சேர்\' என்பதைக் கிளிக் செய்யவும். பெயர், தொடர்பு தகவல் மற்றும் முகவரி போன்ற தேவையான தகவல்களுடன் வாடிக்கையாளர் விவரங்கள் படிவத்தை நிரப்பவும். விற்பனை செயல்முறையின் போது, POS திரையில் வாடிக்கையாளர் தேடல் புலத்தைக் கிளிக் செய்து \'புதிய வாடிக்கையாளரைச் சேர்\' என்பதைத் தேர்ந்தெடுப்பதன் மூலமும் நீங்கள் வாடிக்கையாளர்களை உடனடியாகச் சேர்க்கலாம்.'
          },
          q5: {
            question: 'விற்பனைகளில் தள்ளுபடிகளை வழங்க முடியுமா?',
            answer: 'ஆம், POS திரையில் விற்பனை செயல்முறையின் போது, கட்டணப் பிரிவில் சதவீத தள்ளுபடியைப் பயன்படுத்தலாம். இந்த தள்ளுபடி முழு விற்பனைக்கும் பொருந்தும். குறிப்பிட்ட தயாரிப்பு தள்ளுபடிகளுக்கு, தயாரிப்பு அமைப்புகளில் விலையை நேரடியாகச் சரிசெய்யலாம்.'
          }
        }
      },
      about: {
        title: 'கேஷ்ஃப்ளோ பற்றி',
        version: 'பதிப்பு: 1.0.0',
        description: 'கேஷ்ஃப்ளோ என்பது சிறிய முதல் நடுத்தர அளவிலான வணிகங்களுக்காக வடிவமைக்கப்பட்ட விரிவான விற்பனை நிலையம் மற்றும் வணிக மேலாண்மைத் தீர்வாகும். எங்களின் மென்பொருள் உங்கள் செயல்பாடுகளை எளிமைப்படுத்தவும், சரக்குகளை நிர்வகிக்கவும், விற்பனைகளைச் செயலாக்கவும், வாடிக்கையாளர் உறவுகளைக் கண்காணிக்கவும் உதவுகிறது.',
        features: {
          pos: {
            title: 'விற்பனை நிலையம் (POS)',
            description: 'எளிதில் புரிந்துகொள்ளக்கூடிய இடைமுகத்துடன் விற்பனைகளை விரைவாகவும் திறமையாகவும் செயலாக்கவும். பல கட்டண முறைகள் மற்றும் தள்ளுபடி விருப்பங்களுக்கு ஆதரவு.'
          },
          inventory: {
            title: 'சரக்கு மேலாண்மை',
            description: 'நிகழ்நேர சரக்கு அளவுகளைக் கண்காணிக்கவும், குறைந்த சரக்கு எச்சரிக்கைகளை அமைக்கவும், தயாரிப்பு வகைகளை எளிதாக நிர்வகிக்கவும்.'
          },
          orders: {
            title: 'ஆர்டர் மேலாண்மை',
            description: 'வாடிக்கையாளர் ஆர்டர்களை உருவாக்கி கண்காணிக்கவும், விநியோகங்களை நிர்வகிக்கவும், ஒரே கிளிக்கில் ஆர்டர்களை விற்பனைகளாக மாற்றவும்.'
          },
          customers: {
            title: 'வாடிக்கையாளர் மேலாண்மை',
            description: 'கொள்முதல் வரலாறு, தொடர்பு விவரங்கள், மற்றும் தனிப்பயன் குறிப்புகளுடன் விரிவான வாடிக்கையாளர் தரவுத்தளத்தை உருவாக்கவும்.'
          }
        },
        systemRequirements: {
          title: 'கணினி தேவைகள்',
          requirements: {
            os: 'இயக்க முறைமை: Windows 10/11, macOS 11+, Ubuntu 20.04+',
            browser: 'உலாவி: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+',
            connection: 'இணைய இணைப்பு: அகலப்பட்டை இணைப்பு (1 Mbps அல்லது வேகமானது)',
            screen: 'திரை தெளிவுத்திறன்: குறைந்தபட்சம் 1280x720, பரிந்துரைக்கப்பட்டது 1920x1080'
          }
        },
        legalInformation: {
          title: 'சட்ட தகவல்',
          copyright: '© 2025 கேஷ்ஃப்ளோ வணிக தீர்வுகள். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
          termsOfService: 'சேவை விதிமுறைகள்',
          privacyPolicy: 'தனியுரிமைக் கொள்கை',
          licenseAgreement: 'உரிம ஒப்பந்தம்'
        }
      },
      support: {
        title: 'ஆதரவு விருப்பங்கள்',
        emailSupport: {
          title: 'மின்னஞ்சல் ஆதரவு',
          description: 'பொதுவான கேள்விகள் மற்றும் அவசரமற்ற சிக்கல்களுக்கு, எங்கள் ஆதரவுக் குழுவை மின்னஞ்சல் மூலம் தொடர்பு கொள்ளவும்.',
          email: 'support@cashflow.example.com',
          responseTime: 'பதில் நேரம்: 24-48 மணிநேரம்',
          buttonText: 'மின்னஞ்சல் அனுப்பு'
        },
        liveChat: {
          title: 'நேரடி அரட்டை ஆதரவு',
          description: 'வணிக நேரங்களில் எங்கள் ஆதரவுக் குழுவிடமிருந்து உடனடி உதவியைப் பெறுங்கள்.',
          hours: 'நேரம்: திங்கள்-வெள்ளி, காலை 9:00 - மாலை 5:00',
          waitTime: 'சராசரி காத்திருப்பு நேரம்: 5-10 நிமிடங்கள்',
          buttonText: 'அரட்டையைத் தொடங்கு'
        },
        supportTicket: {
          title: 'ஆதரவு டிக்கெட் சமர்ப்பிக்கவும்',
          description: 'விரிவான தொழில்நுட்ப சிக்கல்கள் அல்லது அம்ச கோரிக்கைகளுக்கு, ஆதரவு டிக்கெட்டைச் சமர்ப்பிக்கவும். எங்கள் குழு விசாரித்து விரைவில் பதிலளிப்பார்கள்.',
          form: {
            subject: 'தலைப்பு',
            description: 'விளக்கம்',
            email: 'மின்னஞ்சல்',
            submit: 'டிக்கெட் சமர்ப்பி'
          }
        },
        commonTopics: {
          title: 'அடிக்கடி கோரப்படும் ஆதரவு தலைப்புகள்',
          passwordReset: 'கடவுச்சொல் மீட்டமைப்பு வழிமுறைகள்',
          networkIssues: 'பிணைய இணைப்பு சிக்கல்களைத் தீர்த்தல்',
          dataImportExport: 'தரவு இறக்குமதி/ஏற்றுமதி வழிகாட்டி',
          printerSetup: 'அச்சுப்பொறிகள் மற்றும் வன்பொருள் அமைப்பு'
        }
      }
    },
    theme: {
      light: "ஒளி பயன்முறை",
      dark: "இருள் பயன்முறை",
      system: "கணினி அமைப்பு"
    },
    languages: {
      en: "English",
      si: "සිංහල",
      ta: "தமிழ்",
      select: "மொழியை தேர்ந்தெடுக்கவும்"
    },
    pos: {
      title: 'விற்பனை நிலையம்',
      cart: {
        empty: 'உங்கள் கார்ட் காலியாக உள்ளது',
        customerSearch: 'பெயர், மின்னஞ்சல் அல்லது தொலைபேசி மூலம் வாடிக்கையாளரைத் தேடுங்கள்',
        customerLabel: 'வாடிக்கையாளர்',
        noCustomersFound: 'வாடிக்கையாளர்கள் கிடைக்கவில்லை',
        totalItems: 'மொத்த பொருட்கள்',
        each: 'ஒன்று',
        searchPlaceholder: 'பொருட்களைத் தேடுங்கள்...',
        noProductsFound: 'பொருட்கள் கிடைக்கவில்லை',
        noProductsMatchSearch: '"{search}" உடன் பொருந்தும் பொருட்கள் கிடைக்கவில்லை',
        quantity: 'அளவு',
        productStatus: {
          outOfStock: 'இல்லை',
          lowStock: 'குறைவு',
          inStock: 'உள்ளது'
        },
        scanBarcode: ""
      },
      payment: {
        taxAndDiscount: 'வரி மற்றும் தள்ளுபடி',
        paymentMethods: 'கட்டண முறைகள்',
        summary: 'சுருக்கம்',
        tax: 'வரி',
        taxDefault: 'வரி % (இயல்புநிலை: {rate}%)',
        discount: 'தள்ளுபடி %',
        deliveryDate: 'விநியோக தேதி',
        cash: 'பணம்',
        card: 'அட்டை',
        bankTransfer: 'வங்கி பரிமாற்றம்',
        subtotal: 'துணை மொத்தம்',
        total: 'மொத்தம்',
        remaining: 'மீதம்',
        change: 'மீதி',
        completePayment: 'கட்டணம் முடிந்தது',
        createOrder: 'ஆர்டர் உருவாக்கு',
        tooltips: {
          addItems: 'கார்டில் பொருட்களைச் சேர்க்கவும்',
          insufficientPayment: 'கட்டணத் தொகை போதுமானதாக இல்லை',
          readyToComplete: 'கட்டணத்தை முடிக்கவும்',
          selectCustomer: 'வாடிக்கையாளரைத் தேர்ந்தெடுக்கவும்',
          readyToOrder: 'ஆர்டர் உருவாக்கு'
        }
      },
      alerts: {
        error: {
          emptyCart: 'கட்டணத்தை முடிக்க முடியவில்லை: கார்ட் காலியாக உள்ளது',
          insufficientPayment: 'கட்டணத்தை முடிக்க முடியவில்லை: கட்டணத் தொகை போதுமானதாக இல்லை',
          createOrder: 'ஆர்டரை உருவாக்க முடியவில்லை: கார்ட் காலியாக உள்ளது',
          noCustomer: 'ஆர்டரை உருவாக்க முடியவில்லை: வாடிக்கையாளர் தேர்ந்தெடுக்கப்படவில்லை',
          generic: 'விற்பனையை முடிக்க முடியவில்லை',
          orderGeneric: 'ஆர்டரை உருவாக்க முடியவில்லை'
        },
        success: {
          orderCreated: 'ஆர்டர் வெற்றிகரமாக உருவாக்கப்பட்டது!'
        }
      }
    },
    orders: {
      title: "ஆர்டர்கள்",
      newOrder: "புதிய ஆர்டர்",
      orderList: "ஆர்டர் பட்டியல்",
      orderDetails: "ஆர்டர் விவரங்கள்",
      editOrder: "ஆர்டரைத் திருத்து",
      noOrders: "ஆர்டர்கள் இல்லை",
      itemCount: "{count} பொருட்கள்",
      status: {
        all: "அனைத்தும்",
        pending: "நிலுவையில்",
        completed: "முடிந்தது",
        cancelled: "ரத்து செய்யப்பட்டது"
      },
      fields: {
        orderId: "ஆர்டர் ஐடி",
        created: "உருவாக்கப்பட்டது",
        deliveryDate: "விநியோக தேதி",
        customer: "வாடிக்கையாளர்",
        items: "பொருட்கள்",
        subtotal: "துணை மொத்தம்",
        total: "மொத்தம்",
        status: "நிலை",
        actions: "செயல்கள்",
        completedDate: undefined,
        saleId: undefined
      },
      filters: {
        search: "ஆர்டர்களைத் தேடு...",
        dateRange: "தேதி வரம்பு",
        allTime: "அனைத்து நேரமும்",
        today: "இன்று",
        yesterday: "நேற்று",
        thisWeek: "இந்த வாரம்",
        lastWeek: "கடந்த வாரம்",
        thisMonth: "இந்த மாதம்",
        lastMonth: "கடந்த மாதம்"
      },
      actions: {
        view: "பார்",
        edit: "திருத்து",
        complete: "முடி",
        cancel: "ரத்து செய்",
        back: "பின்",
        save: "சேமி",
        saveChanges: "மாற்றங்களை சேமி",
        saving: "சேமிக்கிறது..."
      },
      dialogs: {
        complete: {
          title: "ஆர்டரை முடி",
          message: "இந்த ஆர்டரை முடிக்க விரும்புகிறீர்களா? இது விற்பனை பதிவை உருவாக்கி சரக்குகளை புதுப்பிக்கும்.",
          confirm: "முடி"
        },
        cancel: {
          title: "ஆர்டரை ரத்து செய்",
          message: "இந்த ஆர்டரை ரத்து செய்ய விரும்புகிறீர்களா? இந்த செயலை மாற்ற முடியாது.",
          confirm: "ரத்து செய்"
        }
      },
      messages: {
        loading: "ஆர்டர்கள் ஏற்றப்படுகிறது...",
        noData: "ஆர்டர்கள் இல்லை",
        fetchError: "ஆர்டர்களை பெற முடியவில்லை",
        updateSuccess: "ஆர்டர் வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
        updateError: "ஆர்டரை புதுப்பிக்க முடியவில்லை",
        completeSuccess: "ஆர்டர் வெற்றிகரமாக முடிக்கப்பட்டது",
        completeError: "ஆர்டரை முடிக்க முடியவில்லை",
        cancelSuccess: "ஆர்டர் வெற்றிகரமாக ரத்து செய்யப்பட்டது",
        cancelError: "ஆர்டரை ரத்து செய்ய முடியவில்லை",
        noCustomerData: undefined
      },
      pricing: {
        title: "விலை அமைப்புகள்",
        tax: "வரி",
        taxPercentage: "வரி சதவீதம்",
        discount: "தள்ளுபடி",
        discountPercentage: "தள்ளுபடி சதவீதம்"
      },
      orderInfo: {
        title: "ஆர்டர் தகவல்",
        readOnlyItems: "ஆர்டர் பொருட்கள் (படிக்க மட்டும்)",
        readOnlyMessage: "பொருட்களை மாற்ற, ஆர்டரை ரத்து செய்து புதியதை உருவாக்கவும்."
      }
    },
    customers: {
      title: "வாடிக்கையாளர்கள்",
      addCustomer: "வாடிக்கையாளரைச் சேர்க்கவும்",
      editCustomer: "வாடிக்கையாளரைத் திருத்தவும்",
      deleteCustomer: "வாடிக்கையாளரை நீக்கவும்",
      search: "வாடிக்கையாளர்களைத் தேடுங்கள்...",
      fields: {
        name: "பெயர்",
        email: "மின்னஞ்சல்",
        phone: "தொலைபேசி",
        address: "முகவரி",
        discountEligible: "தள்ளுபடி தகுதி"
      },
      placeholders: {
        name: "ஜான் டோ",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: "123 மெயின் தெரு, நகரம், மாநிலம், 12345",
        phoneHelp: "இடைவெளி அல்லது கோடுகள் இல்லாமல் 10 எண்களை உள்ளிடவும்"
      },
      actions: {
        edit: "திருத்து",
        delete: "நீக்கு",
        add: "வாடிக்கையாளரைச் சேர்",
        update: "வாடிக்கையாளரைப் புதுப்பி",
        cancel: "ரத்து செய்"
      },
      deleteConfirm: {
        title: "வாடிக்கையாளரை நீக்கவும்",
        message: '"{name}" வாடிக்கையாளரை நீக்க விரும்புகிறீர்களா? இந்த செயலை மீட்டெடுக்க முடியாது.'
      },
      validation: {
        required: {
          name: "பெயர் தேவை",
          email: "மின்னஞ்சல் தேவை"
        },
        invalid: {
          email: "தவறான மின்னஞ்சல் வடிவம்",
          phone: "தொலைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும்"
        }
      },
      messages: {
        addSuccess: "வாடிக்கையாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்",
        updateSuccess: "வாடிக்கையாளர் வெற்றிகரமாக புதுப்பிக்கப்பட்டார்",
        deleteSuccess: "வாடிக்கையாளர் வெற்றிகரமாக நீக்கப்பட்டார்",
        error: {
          fetch: "வாடிக்கையாளர்களை பெற முடியவில்லை",
          add: "வாடிக்கையாளரை சேர்க்க முடியவில்லை",
          update: "வாடிக்கையாளரை புதுப்பிக்க முடியவில்லை",
          delete: "வாடிக்கையாளரை நீக்க முடியவில்லை"
        }
      },
      status: {
        yes: "ஆம்",
        no: "இல்லை",
        na: "இல்லை"
      }
    },
    dashboard: {
      welcome: 'உங்கள் டாஷ்போர்டுக்கு வரவேற்கிறோம்',
      salesOverview: 'விற்பனை மேலோட்டம்',
      topProducts: 'சிறந்த தயாரிப்புகள்',
      recentOrders: 'சமீபத்திய ஆர்டர்கள்',
      recentSales: 'சமீபத்திய விற்பனைகள்',
      title: 'டாஷ்போர்டு',
      description: 'உங்கள் வணிக செயல்திறன் மற்றும் கணிப்புகளின் மேலோட்டம்',
      comingSoon: 'விரைவில் வருகிறது',
      tabs: {
        overview: 'மேலோட்டம்',
        predictions: 'விற்பனை கணிப்புகள்',
        reports: 'அறிக்கைகள்'
      },
      predictions: {
        title: 'விற்பனை கணிப்புகள்',
        noPredictions: 'கணிப்புகள் கிடைக்கவில்லை',
        dataTooltip: 'கணிப்புகளுக்கு பயன்படுத்தப்படும் வரலாற்று தரவு நாட்கள்',
        daysOfData: 'தரவு நாட்கள்',
        trainModels: 'கணிப்பு மாடல்களை பயிற்றுவிக்கவும்',
        switchView: 'கால அளவை மாற்றவும்',
        tabs: {
          tomorrow: 'நாளை',
          week: 'இந்த வாரம்',
          month: 'இந்த மாதம்'
        }
      },
      diagnostics: {
        title: 'கணிப்பு அமைப்பு',
        description: 'உங்கள் கணிப்பு தரவு தர பகுப்பாய்வு',
        errorLoading: 'நோயறிதல் தகவலை ஏற்றுவதில் பிழை',
        salesRecords: 'விற்பனை பதிவுகள்',
        daysOfHistory: 'வரலாற்று நாட்கள்',
        uniqueProducts: 'தயாரிப்புகள்',
        categories: 'வகைகள்',
        itemsSold: 'விற்கப்பட்ட பொருட்கள்',
        dateRange: 'தேதி வரம்பு',
        predictionTier: 'கணிப்பு அமைப்பு தரம்',
        needMoreData: 'அடிப்படை கணிப்புகளுக்கு மேலும் {days} நாட்கள் தேவை',
        basicDescription: 'அடிப்படை புள்ளியியல் மாடலைப் பயன்படுத்துகிறது. ML கணிப்புகளுக்கு மேலும் {days} நாட்கள்',
        mlDescription: 'அதிக துல்லியத்திற்கு மேம்பட்ட ML கணிப்பு மாடலைப் பயன்படுத்துகிறது',
        tiers: {
          none: 'கணிப்புகள் இல்லை',
          basic: 'அடிப்படை',
          ml: 'மேம்பட்ட ML'
        },
        tooltips: {
          salesRecords: 'உங்கள் வரலாற்றில் மொத்த விற்பனை பரிவர்த்தனைகளின் எண்ணிக்கை',
          daysOfHistory: 'விற்பனை தரவு கிடைக்கும் நாட்களின் எண்ணிக்கை',
          uniqueProducts: 'விற்கப்பட்ட வெவ்வேறு தயாரிப்புகளின் எண்ணிக்கை',
          categories: 'தயாரிப்பு வகைகளின் எண்ணிக்கை',
          itemsSold: 'விற்கப்பட்ட அனைத்து பொருட்களின் மொத்த அளவு',
          dateRange: 'உங்கள் விற்பனை வரலாற்றின் தேதி வரம்பு'
        }
      }
    },
    inventory: undefined
  }
};