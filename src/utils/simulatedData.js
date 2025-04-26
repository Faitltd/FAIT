// Mock data for testing the dashboard components

export const simulatedClientDashboardStats = {
  booking_stats: {
    total_bookings: 12,
    completed_bookings: 8,
    pending_bookings: 2,
    confirmed_bookings: 2,
    cancelled_bookings: 0,
    upcoming_bookings: [
      {
        id: 'b1',
        service_name: 'Plumbing Repair',
        service_date: '2023-05-15',
        service_time: '10:00',
        status: 'confirmed',
        price: 120.00,
        service_agent_name: 'John Smith'
      },
      {
        id: 'b2',
        service_name: 'Electrical Inspection',
        service_date: '2023-05-20',
        service_time: '14:30',
        status: 'pending',
        price: 85.00,
        service_agent_name: 'Sarah Johnson'
      }
    ],
    recent_bookings: [
      {
        id: 'b3',
        service_name: 'HVAC Maintenance',
        service_date: '2023-04-10',
        service_time: '09:00',
        status: 'completed',
        price: 150.00,
        service_agent_name: 'Mike Brown'
      },
      {
        id: 'b4',
        service_name: 'Roof Inspection',
        service_date: '2023-04-05',
        service_time: '11:00',
        status: 'completed',
        price: 95.00,
        service_agent_name: 'Lisa Davis'
      },
      {
        id: 'b5',
        service_name: 'Window Replacement',
        service_date: '2023-03-28',
        service_time: '13:00',
        status: 'completed',
        price: 350.00,
        service_agent_name: 'Robert Wilson'
      }
    ]
  },
  warranty_stats: {
    active_warranties: 3,
    expiring_soon: 1,
    active_warranties_list: [
      {
        id: 'w1',
        service_name: 'Plumbing Repair',
        service_agent_name: 'John Smith',
        start_date: '2023-01-15',
        end_date: '2024-01-15',
        warranty_type: 'Standard'
      },
      {
        id: 'w2',
        service_name: 'HVAC Installation',
        service_agent_name: 'Mike Brown',
        start_date: '2022-11-10',
        end_date: '2023-11-10',
        warranty_type: 'Extended'
      },
      {
        id: 'w3',
        service_name: 'Roof Repair',
        service_agent_name: 'Lisa Davis',
        start_date: '2022-09-05',
        end_date: '2023-06-05',
        warranty_type: 'Limited'
      }
    ]
  },
  subscription_plan: {
    id: 'p1',
    name: 'Premium',
    price: 19.99,
    billing_cycle: 'monthly',
    features: [
      'Priority Booking',
      'Discounted Service Fees',
      'Extended Warranties',
      'Dedicated Support'
    ]
  }
};

export const simulatedServiceAgentDashboardStats = {
  service_stats: {
    total_services: 8,
    active_services: 6,
    services: [
      {
        id: 's1',
        name: 'Plumbing Repair',
        category: 'Plumbing',
        price: 120.00,
        duration: 60,
        status: 'active'
      },
      {
        id: 's2',
        name: 'Electrical Inspection',
        category: 'Electrical',
        price: 85.00,
        duration: 45,
        status: 'active'
      },
      {
        id: 's3',
        name: 'HVAC Maintenance',
        category: 'HVAC',
        price: 150.00,
        duration: 90,
        status: 'active'
      }
    ]
  },
  booking_stats: {
    total_bookings: 18,
    completed_bookings: 12,
    pending_bookings: 3,
    confirmed_bookings: 3,
    cancelled_bookings: 0,
    upcoming_bookings: [
      {
        id: 'b1',
        service_name: 'Plumbing Repair',
        service_date: '2023-05-15',
        service_time: '10:00',
        status: 'confirmed',
        price: 120.00,
        client_name: 'Emma Thompson'
      },
      {
        id: 'b2',
        service_name: 'Electrical Inspection',
        service_date: '2023-05-20',
        service_time: '14:30',
        status: 'confirmed',
        price: 85.00,
        client_name: 'David Wilson'
      }
    ],
    pending_bookings_list: [
      {
        id: 'b6',
        service_name: 'Plumbing Repair',
        service_date: '2023-05-25',
        service_time: '11:00',
        status: 'pending',
        price: 120.00,
        client_name: 'James Anderson'
      },
      {
        id: 'b7',
        service_name: 'HVAC Maintenance',
        service_date: '2023-05-28',
        service_time: '09:30',
        status: 'pending',
        price: 150.00,
        client_name: 'Olivia Martinez'
      }
    ],
    recent_bookings: [
      {
        id: 'b3',
        service_name: 'HVAC Maintenance',
        service_date: '2023-04-10',
        service_time: '09:00',
        status: 'completed',
        price: 150.00,
        client_name: 'Michael Brown'
      },
      {
        id: 'b4',
        service_name: 'Plumbing Repair',
        service_date: '2023-04-05',
        service_time: '11:00',
        status: 'completed',
        price: 120.00,
        client_name: 'Sophia Garcia'
      }
    ]
  },
  warranty_stats: {
    active_warranties: 5,
    expiring_soon: 2,
    warranty_claims: 1
  },
  subscription_plan: {
    id: 'p2',
    name: 'Professional',
    price: 39.99,
    billing_cycle: 'monthly',
    features: [
      'Unlimited Service Listings',
      'Featured in Search Results',
      'Advanced Analytics',
      'Priority Support'
    ]
  }
};

export const simulatedAdminDashboardStats = {
  user_stats: {
    total_users: 1250,
    new_users_this_month: 78,
    active_users: 980,
    user_types: {
      clients: 850,
      service_agents: 380,
      admins: 20
    }
  },
  booking_stats: {
    total_bookings: 3250,
    bookings_this_month: 210,
    completed_bookings: 2800,
    pending_bookings: 150,
    confirmed_bookings: 300,
    cancelled_bookings: 0
  },
  revenue_stats: {
    total_revenue: 285000,
    revenue_this_month: 18500,
    subscription_revenue: 95000,
    service_fee_revenue: 190000
  },
  service_stats: {
    total_services: 1200,
    active_services: 980,
    top_categories: [
      { name: 'Plumbing', count: 210 },
      { name: 'Electrical', count: 185 },
      { name: 'HVAC', count: 160 },
      { name: 'Carpentry', count: 140 },
      { name: 'Painting', count: 120 }
    ]
  },
  warranty_stats: {
    active_warranties: 1800,
    expiring_this_month: 120,
    warranty_claims: 45,
    resolved_claims: 38
  }
};

export const simulatedRecentActivity = [
  {
    id: 'a1',
    type: 'booking',
    action: 'created',
    date: '2023-05-01T10:30:00Z',
    details: {
      service_name: 'Plumbing Repair',
      client_name: 'Emma Thompson',
      service_agent_name: 'John Smith'
    }
  },
  {
    id: 'a2',
    type: 'message',
    action: 'received',
    date: '2023-05-01T09:15:00Z',
    details: {
      from: 'John Smith',
      preview: 'I'll be arriving at your location around 10 AM tomorrow...'
    }
  },
  {
    id: 'a3',
    type: 'warranty',
    action: 'activated',
    date: '2023-04-30T14:45:00Z',
    details: {
      service_name: 'HVAC Installation',
      service_agent_name: 'Mike Brown',
      duration: '12 months'
    }
  },
  {
    id: 'a4',
    type: 'booking',
    action: 'completed',
    date: '2023-04-29T16:20:00Z',
    details: {
      service_name: 'Electrical Inspection',
      client_name: 'David Wilson',
      service_agent_name: 'Sarah Johnson'
    }
  },
  {
    id: 'a5',
    type: 'payment',
    action: 'processed',
    date: '2023-04-29T16:25:00Z',
    details: {
      amount: '$85.00',
      service_name: 'Electrical Inspection',
      payment_method: 'Credit Card'
    }
  }
];

export const simulatedConversations = [
  {
    id: 'c1',
    service_agent: {
      first_name: 'John',
      last_name: 'Smith',
      avatar_url: null
    },
    service: {
      name: 'Plumbing Repair'
    },
    last_message: 'I'll be arriving at your location around 10 AM tomorrow. Please make sure someone is available to let me in.',
    last_message_time: '2023-05-01T09:15:00Z'
  },
  {
    id: 'c2',
    service_agent: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      avatar_url: null
    },
    service: {
      name: 'Electrical Inspection'
    },
    last_message: 'Thank you for your payment. I've attached the inspection report for your records.',
    last_message_time: '2023-04-29T16:30:00Z'
  },
  {
    id: 'c3',
    service_agent: {
      first_name: 'Mike',
      last_name: 'Brown',
      avatar_url: null
    },
    service: {
      name: 'HVAC Maintenance'
    },
    last_message: 'Your warranty has been activated. It will be valid for 12 months from today.',
    last_message_time: '2023-04-30T14:50:00Z'
  }
];

// Helper function to get simulated data based on user type
export function getSimulatedDashboardData(userType) {
  switch (userType) {
    case 'client':
      return simulatedClientDashboardStats;
    case 'service_agent':
      return simulatedServiceAgentDashboardStats;
    case 'admin':
      return simulatedAdminDashboardStats;
    default:
      return null;
  }
}
