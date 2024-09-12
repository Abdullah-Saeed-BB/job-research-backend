Developed a job research backend. This Job research project will contain a Front-end using Next JS, and a mobile app using React native.

1. [Technolgies](#technolgies)
2. [End points](#end-points)
3. [Database Schema](#database-schema)

## Technolgies:

<div>
	<img src="https://img.shields.io/badge/Express-dbd02c?logo=express&logoColor=black&style=for-the-badge" height="30" alt="Express logo"/>
	<img src="https://img.shields.io/badge/PostgreSQL-385a96?logo=postgresql&logoColor=white&style=for-the-badge" height="30" alt="PostgreSQL logo"/>
	<img src="https://img.shields.io/badge/Prisma-6562f0?logo=PrIsMa&logoColor=white&style=for-the-badge" height="30" alt="Prisma logo"/>
	<img src="https://img.shields.io/badge/JWT-black?logo=jsonwebtokens&logoColor=white&style=for-the-badge" height="30" alt="JWT logo"/>
</div>

## Endpoints:

<table>
	<thead>
		<tr>
			<th>Path</th>
			<th>Method</th>
			<th>Is need auth (JWT)</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th colspan="4">USER</th>
		</tr>
		<tr>
			<td>/api/user</td>
			<td>GET</td>
			<td>✖️</td>
			<td>To get all users</td>
		</tr>
		<tr>
			<td>/api/user/:id</td>
			<td>GET</td>
			<td>✖️</td>
			<td>To get user</td>
		</tr>
		<tr>
			<td>/api/user/my-account</td>
			<td>GET</td>
			<td>✔️</td>
			<td>To get client data</td>
		</tr>
		<tr>
			<td>/api/user/jobSeeker</td>
			<td>GET</td>
			<td>✖️</td>
			<td>To get all job seekers</td>
		</tr>
		<tr>
			<td>/api/user/jobSeeker/:seeker_id/experience</td>
			<td>GET</td>
			<td>✔️</td>
			<td>To get all experience of job seeker</td>
		</tr>
		<tr>
			<td>/api/user/jobSeeker/application</td>
			<td>GET</td>
			<td>✔️</td>
			<td>As job seeker, this is to get all applications that you submitted </td>
		</tr>
		<tr>
			<td>/api/user/hirer</td>
			<td>GET</td>
			<td>✖️</td>
			<td>To get all hirer</td>
		</tr>
		<tr>
			<td>/api/user/hirer/:hirer_id/jobPost</td>
			<td>GET</td>
			<td>✖️</td>
			<td>To get all job posts that the hirer posted</td>
		</tr>
		<tr>
			<td>/api/user/jobSeeker/:hirer_id</td>
			<td>POST</td>
			<td>✔️</td>
			<td>As job seeker, this is for following hirer</td>
		</tr>
		<tr>
			<td>/api/user/signup</td>
			<td>POST</td>
			<td>✖️</td>
			<td>To sign up</td>
		</tr>
		<tr>
			<td>/api/user/login</td>
			<td>POST</td>
			<td>✖️</td>
			<td>To login</td>
		</tr>
		<tr>
			<td>/api/user/refresh</td>
			<td>POST</td>
			<td>✔️</td>
			<td>To generate a new access token</td>
		</tr>
		<tr>
			<td>/api/user</td>
			<td>PUT</td>
			<td>✔️</td>
			<td>To edit your user data</td>
		</tr>
		<tr>
			<td>/api/user/jobSeeker/:job_id</td>
			<td>PUT</td>
			<td>✔️</td>
			<td>As job seeker, this for saving jobs</td>
		</tr>
		<tr>
			<td>/api/user/link</td>
			<td>PUT</td>
			<td>✔️</td>
			<td>To add links to your user account</td>
		</tr>
		<tr>
			<td>/api/user</td>
			<td>DELETE</td>
			<td>✔️</td>
			<td>To delete your account</td>
		</tr>
		<tr>
			<th colspan="4">EXPERIENCE</th>
		</tr>
		<tr>
			<td>/api/experience</td>
			<td>POST</td>
			<td>✔️</td>
			<td>As job seeker, this is for creating new experience</td>
		</tr>
		<tr>
			<td>/api/experience/:exp_id</td>
			<td>PUT</td>
			<td>✔️</td>
			<td>To edit experience</td>
		</tr>
		<tr>
			<td>/api/experience/:exp_id</td>
			<td>DELETE</td>
			<td>✔️</td>
			<td>To delete experience</td>
		</tr>
		<tr>
			<th colspan="4">JOB</th>
		</tr>
		<tr>
			<td>/api/job?query=&major=&isOpen=&workStyle=&experienceYears=&jobType=&salaryRange=</td>
			<td>GET</td>
			<td>✖️</td>
			<td>To get all job posts, and filter it</td>
		</tr>
		<tr>
			<td>/api/job/:job_id</td>
			<td>GET</td>
			<td>✖️</td>
			<td>To get job post</td>
		</tr>
		<tr>
			<td>/api/job/:job_id/application</td>
			<td>GET</td>
			<td>✔️</td>
			<td>As hirer, this is for getting all applications of your job post</td>
		</tr>
		<tr>
			<td>/api/job</td>
			<td>POST</td>
			<td>✔️</td>
			<td>To post new job</td>
		</tr>
		<tr>
			<td>/api/job/:job_id</td>
			<td>PUT</td>
			<td>✔️</td>
			<td>To edit job post</td>
		</tr>
		<tr>
			<td>/api/job/:job_id</td>
			<td>DELETE</td>
			<td>✔️</td>
			<td>To delete job post</td>
		</tr>
		<tr>
			<th colspan="4">APPLICATION</th>
		</tr>
		<tr>
			<td>/api/application/:app_id</td>
			<td>GET</td>
			<td>✔️</td>
			<td>to get application</td>
		</tr>
		<tr>
			<td>/api/application</td>
			<td>POST</td>
			<td>✔️</td>
			<td>To submit an application</td>
		</tr>
		<tr>
			<td>/api/application/:app_id</td>
			<td>PUT</td>
			<td>✔️</td>
			<td>To add notes to the application</td>
		</tr>
		<tr>
			<td>/api/application/:app_id/status</td>
			<td>PUT</td>
			<td>✔️</td>
			<td>To edit application status, and send notification to the submiter</td>
		</tr>
		<tr>
			<td>/api/application/:job_id/filter?sensitive=&minYearsExperience&isCancel=</td>
			<td>PUT</td>
			<td>✔️</td>
			<td>To filter all the applications of the job post, and may cancel it</td>
		</tr>
		<tr>
			<th colspan="4">NOTIFICATION</th>
		</tr>
		<tr>
			<td>/api/notification</td>
			<td>GET</td>
			<td>✔️</td>
			<td>To get all your notifications</td>
		</tr>
		<tr>
			<td>/api/notification</td>
			<td>PUT</td>
			<td>✔️</td>
			<td>To set the notification to 'read' statue</td>
		</tr>
		<tr>
			<td>/api/notification/:notifi_id</td>
			<td>DELETE</td>
			<td>✔️</td>
			<td>To delete a notification</td>
		</tr>
	</tbody>
</table>

## Database schema

![Job_research_schema](https://github.com/user-attachments/assets/2a6f87ce-61c8-493c-995b-c57ebd6e7598)
