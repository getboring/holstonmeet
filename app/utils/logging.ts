import { type ApiHistoryEntry } from 'partytracks/client'

export type LogEvent =
	| {
			eventName: 'onStart'
			meetingId?: string
	  }
	| {
			eventName: 'alarm'
			meetingId?: string
	  }
	| {
			eventName: 'onConnect'
			meetingId?: string
			foundInStorage: boolean
			connectionId: string
	  }
	| {
			eventName: 'onClose'
			meetingId?: string
			connectionId: string
			code: number
			reason: string
			wasClean: boolean
	  }
	| {
			eventName: 'userLeft'
			meetingId?: string
			connectionId: string
	  }
	| {
			eventName: 'cleaningUpConnections'
			meetingId?: string
			connectionsFound: number
			websocketsFound: number
			websocketStatuses: number[]
	  }
	| {
			eventName: 'userTimedOut'
			meetingId?: string
			connectionId: string
	  }
	| {
			eventName: 'startingMeeting'
			meetingId?: string
	  }
	| {
			eventName: 'endingMeeting'
			meetingId?: string
	  }
	| {
			eventName: 'meetingIdNotFoundInCleanup'
	  }
	| {
			eventName: 'errorBroadcastingToUser'
			meetingId?: string
			connectionId: string
	  }
	| {
			eventName: 'onErrorHandler'
			error: unknown
	  }
	| {
			eventName: 'onErrorHandlerDetails'
			meetingId?: string
			connectionId: string
			error: unknown
	  }
	| {
			eventName: 'errorHandlingMessage'
			meetingId?: string
			connectionId: string
			error: unknown
	  }
	| {
			eventName: 'clientNegotiationRecord'
			entry: ApiHistoryEntry
			meetingId?: string
			connectionId: string
			sessionId?: string
	  }
	| {
			eventName: 'dmUserNotFound'
			meetingId?: string
			to: string
			from?: string
	  }
	| {
			eventName: 'aiRenegotiation'
			meetingId?: string
			phase: string
	  }
	| {
			eventName: 'aiSessionStarted'
			meetingId?: string
			sessionId: string
	  }
	| {
			eventName: 'aiExchangeStepTwo'
			meetingId?: string
			phase: string
	  }
	| {
			eventName: 'openaiRequest'
			endpoint: string
	  }
	| {
			eventName: 'openaiError'
			endpoint: string
			status?: number
	  }

export function log(event: LogEvent) {
	// eslint-disable-next-line no-console
	console.log(JSON.stringify(event))
}
