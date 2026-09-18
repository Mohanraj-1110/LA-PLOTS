/**
 * Realistic Indian Real Estate Messages & Chat Threads Mock Dataset
 */
export const initialConversations = [
  {
    id: 'conv-01',
    customerId: 'cust-01',
    customerName: 'Rajesh Subramanian',
    customerPhone: '+91 98450 12834',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Sure Vikram, I will be at the MG Road office on Saturday 3 PM.',
    timestamp: '2026-09-17T11:45:00Z',
    unreadCount: 1,
    messages: [
      {
        id: 'm-1',
        sender: 'agent',
        text: 'Hello Mr. Rajesh, thank you for visiting Greenfield Meadows on Sunday. How did your family like plot GM-101?',
        timestamp: '2026-09-15T10:00:00Z',
      },
      {
        id: 'm-2',
        sender: 'customer',
        text: 'Hello Vikram, we really liked the 40ft road approach and east orientation. However, is there any flexibility on registration charges?',
        timestamp: '2026-09-15T12:30:00Z',
      },
      {
        id: 'm-3',
        sender: 'agent',
        text: 'We can discuss a festive waiver on the club membership fee during an in-person meeting with our Sales Director.',
        timestamp: '2026-09-16T09:15:00Z',
      },
      {
        id: 'm-4',
        sender: 'customer',
        text: 'Sure Vikram, I will be at the MG Road office on Saturday 3 PM.',
        timestamp: '2026-09-17T11:45:00Z',
      },
    ],
  },
  {
    id: 'conv-02',
    customerId: 'cust-02',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 97112 45890',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Token payment receipt downloaded. Thank you!',
    timestamp: '2026-09-16T17:10:00Z',
    unreadCount: 0,
    messages: [
      {
        id: 'm-21',
        sender: 'customer',
        text: 'Hi Vikram, I transferred ₹1 Lakh booking advance for GM-102 via IMPS.',
        timestamp: '2026-09-16T15:20:00Z',
      },
      {
        id: 'm-22',
        sender: 'agent',
        text: 'Received with thanks Ms. Ananya! I have generated the official booking receipt and uploaded it to your customer documents.',
        timestamp: '2026-09-16T16:00:00Z',
      },
      {
        id: 'm-23',
        sender: 'customer',
        text: 'Token payment receipt downloaded. Thank you!',
        timestamp: '2026-09-16T17:10:00Z',
      },
    ],
  },
  {
    id: 'conv-03',
    customerId: 'cust-04',
    customerName: 'Dr. Suresh Reddy',
    customerPhone: '+91 98850 33412',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Will the layout engineer be present on site at 10:30 AM tomorrow?',
    timestamp: '2026-09-17T10:00:00Z',
    unreadCount: 2,
    messages: [
      {
        id: 'm-31',
        sender: 'agent',
        text: 'Good morning Dr. Reddy. Site visit for plot SE-12 at Sunrise Enclave has been scheduled for Friday 10:30 AM.',
        timestamp: '2026-09-16T18:00:00Z',
      },
      {
        id: 'm-32',
        sender: 'customer',
        text: 'Will the layout engineer be present on site at 10:30 AM tomorrow?',
        timestamp: '2026-09-17T10:00:00Z',
      },
    ],
  },
];
