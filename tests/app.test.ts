import { describe, it, expect, vi, beforeEach } from 'vitest';
import { closeEvent, fetchEvents, createEvent } from '../src/services/eventService';

// Mock Supabase client and dependencies for service tests
vi.mock('../src/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnValue({ data: { id: 'evt-1', open: true }, error: null }),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation(cb => cb({ data: [], error: null })),
      catch: vi.fn()
    })
  })
}));

describe('eventService', () => {
  it('should create an event with open=true by default', async () => {
    const { event, error } = await createEvent('Test Event', 'user-1', 1000);
    expect(error).toBeNull();
    expect(event).toBeDefined();
    expect(event.open).toBe(true);
  });

  it('should close an event (set open=false)', async () => {
    const { success, error } = await closeEvent('event-1');
    expect(error).toBeNull();
    expect(success).toBe(true);
  });

  it('should fetch events and include open field', async () => {
    const { events, error } = await fetchEvents('user-1');
    expect(error).toBeNull();
    expect(Array.isArray(events)).toBe(true);
    // open field should be present in returned event objects
    if (events.length > 0) {
      expect(typeof events[0].open).toBe('boolean');
    }
  });
});

// Add more tests for UI if using Vitest + @vue/test-utils
// Example: HuntListItem.vue color coding
import { mount } from '@vue/test-utils';
import HuntListItem from '../src/components/Admin/HuntListItem.vue';

describe('HuntListItem.vue', () => {
  it('applies item-active class for active hunt item', () => {
    const wrapper = mount(HuntListItem, {
      props: {
        huntItem: { id: '1', item: 'Test', active: true }
      }
    });
    expect(wrapper.classes()).toContain('item-active');
  });

  it('applies item-inactive class for inactive hunt item', () => {
    const wrapper = mount(HuntListItem, {
      props: {
        huntItem: { id: '1', item: 'Test', active: false }
      }
    });
    expect(wrapper.classes()).toContain('item-inactive');
  });
});
