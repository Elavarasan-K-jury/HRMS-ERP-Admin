<template>
  <div class="flex flex-col h-full">
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-3">
      <!--
        Approvals Inbox — Leave sub-view only for now.
        Heading, filters, action row, table, pagination live in ApprovalsInbox.
        Other entity tabs (Regularisation / Workday / Exit) will attach as
        badge-counted category tabs above the heading inside that component.
      -->
      <ApprovalsInbox ref="inbox" @refresh="onRefresh" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'organization' })

function onRefresh() {
  // reserved for cross-widget counters if needed later
}
</script>
