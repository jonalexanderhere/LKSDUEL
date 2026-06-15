import React from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/shared/ui'
import type { Event, EventJoinRequestRow } from '../types'

interface JoinRequestsCardProps {
  events: Event[]
  manageEventId: string
  onManageEventChange: (eventId: string) => void
  joinRequests: EventJoinRequestRow[]
  loadingJoinRequests: boolean
  reviewingRequestId: string | null
  onReviewRequest: (requestId: string, approve: boolean) => void
}

const JoinRequestsCard: React.FC<JoinRequestsCardProps> = ({
  events,
  manageEventId,
  onManageEventChange,
  joinRequests,
  loadingJoinRequests,
  reviewingRequestId,
  onReviewRequest,
}) => {
  return (
    <Card className="bg-[#fdf6e3] dark:bg-[#1A100C] border border-amber-900/50 dark:border-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
      <CardHeader>
        <CardTitle className="text-amber-900 dark:text-amber-50">Join Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Event</Label>
          <select
            value={manageEventId}
            onChange={(event) => onManageEventChange(event.target.value)}
            className="w-full px-3 py-2 text-sm border border-amber-900/50 dark:border-gray-600 rounded-md bg-[#fdf6e3] dark:bg-[#1A100C] text-amber-900 dark:text-amber-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
          >
            <option value="">Select event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </div>

        <div className="border border-amber-900/50 dark:border-gray-700 rounded-md overflow-hidden">
          {loadingJoinRequests ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading requests...</div>
          ) : joinRequests.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No pending requests</div>
          ) : (
            joinRequests.map((request) => (
              <div key={request.request_id} className="px-3 py-3 border-b last:border-b-0 border-amber-900/50 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-50">{request.username || request.user_id}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Requested at {new Date(request.requested_at).toLocaleString()}</p>
                  {request.note && <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">Note: {request.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onReviewRequest(request.request_id, true)}
                    disabled={reviewingRequestId === request.request_id}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReviewRequest(request.request_id, false)}
                    disabled={reviewingRequestId === request.request_id}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default JoinRequestsCard



