<template>
  <div class="hunt-games-stream">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center p-2">
      <div class="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Stats header -->
    <div v-if="!loading" class="stream-stats">
      <div class="stat"><span class="label">Starting</span><span class="value value-gold">{{ formatCurrency(startingBalance) }}</span></div>
      <div class="stat"><span class="label">Items</span><span class="value value-gold">{{ totalItems }}</span></div>
      <div class="stat"><span class="label">Bonuses</span><span class="value value-bonus">{{ totalBonus }}</span></div>
      <div class="stat"><span class="label">Super</span><span class="value value-super">{{ totalSuper }}</span></div>
    </div>

    <!-- Single-line auto-scrolling ticker -->
    <div v-if="!loading && huntItems.length > 0" ref="tickerContainer" class="ticker">
      <div ref="tickerTrack" class="ticker-track" :class="{ 'no-scroll': scrollDistance <= 0 }" :style="{ '--scroll-distance': scrollDistance + 'px' }">
        <div
          v-for="item in huntItems"
          :key="item.id"
          :class="[
            'game-card',
            'ticker-card',
            getGameStatusClass(item)
          ]"
          :title="getGameTooltip(item)"
        >
          <!-- Game thumbnail -->
          <div class="game-thumb">
            <img 
              :src="getGameThumbnail(item)" 
              :alt="item.item || 'Game'"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          
          <!-- Completed overlay -->
          <div v-if="item.completed" class="completed-overlay">
            <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <!-- White outline underneath -->
              <path d="M20 6L9 17l-5-5" stroke="#ffffff" stroke-width="6" />
              <!-- Green check on top -->
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          
          <!-- Game name -->
          <div class="game-name">
            {{ formatGameName(item.item || 'Unknown') }}
          </div>

          <!-- Status indicator -->
          <div class="status-indicator">
            <span v-if="item.super_bonus" class="status-badge super">S</span>
            <span v-else-if="item.bonus" class="status-badge bonus">B</span>
            <span v-else class="status-badge regular">R</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading" class="empty-state">
      <div class="text-gold text-sm opacity-75">No games in hunt</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { getEvent } from '../../services/eventService';
import { fetchHuntList } from '../../services/huntItemService';
import { getSupabaseClient } from '../../lib/supabase';
import type { HuntItem } from '../../types/hunt';

interface Props {
  eventId: string;
  refreshInterval?: number; // Auto-refresh interval in seconds (default: 30)
}

const props = withDefaults(defineProps<Props>(), {
  refreshInterval: 30
});

// Reactive data
const huntItems = ref<HuntItem[]>([]);
const loading = ref(true);
const startingBalance = ref<number>(0);
const tickerContainer = ref<HTMLElement | null>(null);
const tickerTrack = ref<HTMLElement | null>(null);
const scrollDistance = ref(0);
let refreshTimer: number | null = null;
let realtimeChannel: any = null;

// Fetch hunt items
const fetchHuntItems = async () => {
  console.log('Fetching hunt items for eventId:', props.eventId);
  try {
    const { huntItems: items, error } = await fetchHuntList(props.eventId);
    
    if (error) {
      console.error('Error fetching hunt items:', error);
      return;
    }
    
    // Only show active items
    console.log('Fetched hunt items:', items);
    huntItems.value = items.filter(item => item.active);
  } catch (error) {
    console.error('Exception fetching hunt items:', error);
  } finally {
    loading.value = false;
    await nextTick();
    updateScrollDistance();
  }
};

// Totals
const totalBonus = computed(() => huntItems.value.filter(i => i.bonus).length);
const totalSuper = computed(() => huntItems.value.filter(i => i.super_bonus).length);
const totalItems = computed(() => huntItems.value.length);

// Currency formatter
const formatCurrency = (val: number | null | undefined): string => {
  const n = typeof val === 'number' ? val : 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};

// Get game status CSS class based on bonus type
const getGameStatusClass = (item: HuntItem): string => {
  if (item.super_bonus) return 'super-bonus';
  if (item.bonus) return 'bonus';
  return 'regular';
};

// Get tooltip text for game
const getGameTooltip = (item: HuntItem): string => {
  const status = item.super_bonus ? 'Super Bonus' : item.bonus ? 'Bonus' : 'Regular';
  const wager = item.wager ? `Wager: ${item.wager}` : '';
  const result = item.result ? `Result: ${item.result}` : '';
  
  return [item.item, status, wager, result].filter(Boolean).join(' • ');
};

// Get game thumbnail URL
const getGameThumbnail = (item: HuntItem): string => {
  if (item.custom_thumb) {
    return item.custom_thumb.replace('cdn://', 'https://cdnv1.500.casino/');
  }
  return '/placeholder-game.png';
};

// Format game name for display
const formatGameName = (name: string): string => {
  return name.length > 20 ? name.substring(0, 17) + '...' : name;
};

// Handle image loading errors
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-game.png';
};

// Setup real-time updates
const setupRealtimeUpdates = () => {
  const supabase = getSupabaseClient();
  
  // Hunt items changes -> refresh list so totals update immediately
  realtimeChannel = supabase
    .channel('hunt-items-stream')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hunt_items',
        filter: `event_id=eq.${props.eventId}`
      },
      () => {
        fetchHuntItems();
      }
    )
    // Starting balance changes -> update startingBalance in header
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'suggestion_events',
        filter: `id=eq.${props.eventId}`
      },
      (payload: any) => {
        const newStarting = payload?.new?.starting_balance;
        if (typeof newStarting === 'number') {
          startingBalance.value = newStarting;
        } else {
          // Fallback: refetch event if payload lacks value
          getEvent(props.eventId).then(({ event }) => {
            if (event && typeof event.starting_balance === 'number') {
              startingBalance.value = event.starting_balance;
            }
          }).catch(() => {});
        }
      }
    )
    .subscribe();
};

// Setup auto-refresh timer
const setupAutoRefresh = () => {
  if (props.refreshInterval > 0) {
    refreshTimer = setInterval(() => {
      fetchHuntItems();
    }, props.refreshInterval * 1000) as unknown as number;
  }
};

// Cleanup function
const cleanup = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  
  if (realtimeChannel) {
    realtimeChannel.unsubscribe();
    realtimeChannel = null;
  }
};

// Lifecycle hooks
onMounted(async () => {
  await fetchHuntItems();
  // fetch event for starting balance
  try {
    const { event } = await getEvent(props.eventId);
    if (event && typeof event.starting_balance === 'number') {
      startingBalance.value = event.starting_balance;
    }
  } catch (e) {
    console.error('Error fetching event for starting balance', e);
  }
  setupRealtimeUpdates();
  setupAutoRefresh();
  // Measure after initial mount
  await nextTick();
  updateScrollDistance();
  window.addEventListener('resize', updateScrollDistance);
});

onUnmounted(() => {
  cleanup();
  window.removeEventListener('resize', updateScrollDistance);
});

// Recompute scroll distance when items change
watch(huntItems, async () => {
  await nextTick();
  updateScrollDistance();
});

// Compute scroll distance for back-and-forth animation
const updateScrollDistance = () => {
  const c = tickerContainer.value?.offsetWidth || 0;
  const t = tickerTrack.value?.scrollWidth || 0;
  scrollDistance.value = Math.max(0, t - c);
};
</script>

<style scoped>
.hunt-games-stream {
  background-color: rgba(89, 33, 1, 0.95);
  border-radius: 0.5rem;
  padding: 0.5rem;
  backdrop-filter: blur(4px);
  font-family: 'Inter', sans-serif;
}

/* Ticker layout */
.ticker {
  overflow: hidden;
  white-space: nowrap;
}

.ticker-track {
  display: inline-flex;
  gap: 0.25rem;
  animation: scrollX 20s linear infinite alternate;
}

.ticker-track.no-scroll {
  animation: none;
}

@keyframes scrollX {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-1 * var(--scroll-distance, 0px))); }
}

/* Ticker cards keep compact sizing */
.ticker-card {
  width: 100px;
  height: 100px;
  flex: 0 0 auto;
}

/* Summary stats header */
.stream-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(60, 30, 10, 0.85);
  border: 1px solid #ea580c; /* orange */
  border-radius: 0.375rem;
  margin-bottom: 0.25rem;
}

.stream-stats .stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 12px;
}

.stream-stats .stat + .stat {
  position: relative;
  padding-left: 0.5rem;
}

.stream-stats .stat + .stat::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 14px;
  background: rgba(234, 88, 12, 0.4); /* orange/40 */
}

.stream-stats .label {
  color: rgba(250, 204, 21, 0.8); /* gold/80 */
}

.stream-stats .value {
  font-weight: 700;
}

.stream-stats .value-gold {
  color: #facc15; /* gold */
}

.stream-stats .value-bonus {
  color: #c4b5fd; /* violet-300 */
}

.stream-stats .value-super {
  color: #fbbf24; /* amber-400 */
}

.games-grid {
  display: grid;
  gap: 0.25rem;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  max-height: 400px;
  overflow-y: auto;
}

.game-card {
  position: relative;
  border-radius: 0.375rem;
  overflow: hidden;
  transition: all 0.2s;
  aspect-ratio: 1;
  border: 2px solid transparent;
}

.game-card:hover {
  transform: scale(1.05);
}

/* Color coding for different hunt types */
.game-card.super-bonus {
  border-color: #fbbf24; /* amber-400 */
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
}

.game-card.bonus {
  border-color: #8b5cf6; /* violet-500 */
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
}

.game-card.regular {
  border-color: #6b7280; /* gray-500 */
}

.game-thumb {
  width: 100%;
  height: 100%;
  position: relative;
}

.game-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 10px;
  padding: 0.125rem 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.status-indicator {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
}

.status-badge {
  font-size: 9px;
  font-weight: bold;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  color: black;
  line-height: 1;
  min-width: 14px;
  text-align: center;
}

.status-badge.super {
  background-color: #fbbf24; /* amber-400 */
}

.status-badge.bonus {
  background-color: #8b5cf6; /* violet-500 */
  color: white;
}

.status-badge.regular {
  background-color: #9ca3af; /* gray-400 */
}

.empty-state {
  text-align: center;
  padding: 1rem 0;
}

/* Completed overlay styling */
.completed-overlay {
  position: absolute;
  inset: 0;
  background: rgba(34, 197, 94, 0.35); /* green-500 with transparency */
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: #22c55e; /* green-500, more vibrant */
  width: 52px;
  height: 52px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
}

/* Scrollbar styling for webkit browsers */
.games-grid::-webkit-scrollbar {
  width: 4px;
}

.games-grid::-webkit-scrollbar-track {
  background-color: #3c1e0a;
  border-radius: 0.25rem;
}

.games-grid::-webkit-scrollbar-thumb {
  background-color: #ea580c;
  border-radius: 0.25rem;
}

.games-grid::-webkit-scrollbar-thumb:hover {
  background-color: rgba(234, 88, 12, 0.8);
}
</style>
