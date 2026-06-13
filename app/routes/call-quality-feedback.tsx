import { type ActionFunctionArgs } from 'react-router'
import { Form, useSearchParams } from 'react-router'
import { AnalyticsSimpleCallFeedback, getDb } from 'schema'
import invariant from 'tiny-invariant'
import { Button } from '~/components/Button'
import { RELEASE } from '~/utils/constants'

const redirectToHome = new Response(null, {
	status: 302,
	headers: {
		Location: '/',
	},
})

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const db = getDb(context)
	if (!db) return redirectToHome

	const formData = await request.formData()
	const experiencedIssues = formData.get('experiencedIssues') === 'true'
	const meetingId = formData.get('meetingId')
	invariant(typeof meetingId === 'string')
	await db.insert(AnalyticsSimpleCallFeedback).values({
		experiencedIssues: Number(experiencedIssues),
		version: RELEASE ?? 'dev',
		meetingId,
	})

	return redirectToHome
}

export default function SetUsername() {
	const [params] = useSearchParams()
	const meetingId = params.get('meetingId')
	return (
		<div className="grid h-full gap-4 place-content-center bg-linear-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
			{meetingId ? (
				<>
					<h1 className="text-3xl font-bold">Experience any issues?</h1>
					<Form className="flex items-end gap-4" method="post">
						<Button
							displayType="secondary"
							value="true"
							name="experiencedIssues"
						>
							Yes
						</Button>
						<Button
							displayType="secondary"
							value="false"
							name="experiencedIssues"
						>
							No
						</Button>
						<input type="hidden" name="meetingId" value={meetingId} />
					</Form>
				</>
			) : (
				<h1>Missing meetingId</h1>
			)}
		</div>
	)
}
