<script setup lang="ts">
interface Column {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
  loading?: boolean
  emptyMessage?: string
  hoverable?: boolean
  striped?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'No data available',
  hoverable: true,
  striped: false,
})

const emit = defineEmits<{
  rowClick: [row: Record<string, any>, index: number]
}>()

const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value!]
    const bVal = b[sortKey.value!]
    
    if (aVal === bVal) return 0
    
    const comparison = aVal < bVal ? -1 : 1
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const handleSort = (column: Column) => {
  if (!column.sortable) return
  
  if (sortKey.value === column.key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortDirection.value = 'asc'
  }
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-surface-700/50">
    <table class="w-full text-sm text-left">
      <!-- Header -->
      <thead class="bg-surface-800/50 text-xs uppercase tracking-wider text-slate-400">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-6 py-4 font-semibold',
              alignClasses[column.align || 'left'],
              column.sortable ? 'cursor-pointer hover:text-slate-300 select-none' : '',
            ]"
            :style="column.width ? { width: column.width } : undefined"
            @click="handleSort(column)"
          >
            <div class="flex items-center gap-2" :class="{ 'justify-center': column.align === 'center', 'justify-end': column.align === 'right' }">
              {{ column.label }}
              <Icon
                v-if="column.sortable"
                :name="sortKey === column.key 
                  ? (sortDirection === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down')
                  : 'mdi:unfold-more-horizontal'"
                class="w-4 h-4 opacity-50"
              />
            </div>
          </th>
        </tr>
      </thead>
      
      <!-- Body -->
      <tbody>
        <!-- Loading state -->
        <template v-if="loading">
          <tr v-for="i in 5" :key="i">
            <td v-for="column in columns" :key="column.key" class="px-6 py-4">
              <div class="skeleton h-4 w-full max-w-[150px]" />
            </td>
          </tr>
        </template>
        
        <!-- Empty state -->
        <tr v-else-if="data.length === 0">
          <td :colspan="columns.length" class="px-6 py-12 text-center text-slate-500">
            <Icon name="mdi:database-off" class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{{ emptyMessage }}</p>
          </td>
        </tr>
        
        <!-- Data rows -->
        <tr
          v-else
          v-for="(row, index) in sortedData"
          :key="index"
          :class="[
            'border-b border-surface-700/50 transition-colors',
            hoverable ? 'hover:bg-surface-800/30 cursor-pointer' : '',
            striped && index % 2 === 1 ? 'bg-surface-800/20' : '',
          ]"
          @click="$emit('rowClick', row, index)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="['px-6 py-4', alignClasses[column.align || 'left']]"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

