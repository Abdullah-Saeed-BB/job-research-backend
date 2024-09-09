Developed a job search backend. This Job Reasearch project will contain Front-end using Next JS, and mobile app using React native. 
### Technolgies:
<div>
	<img src="https://img.shields.io/badge/Express-dbd02c?logo=express&logoColor=black&style=for-the-badge" height="30" alt="Express logo"/>
	<img src="https://img.shields.io/badge/PostgreSQL-385a96?logo=postgresql&logoColor=white&style=for-the-badge" height="30" alt="PostgreSQL logo"/>
	<img src="https://img.shields.io/badge/Prisma-6562f0?logo=PrIsMa&logoColor=white&style=for-the-badge" height="30" alt="Prisma logo"/>
	<img src="https://img.shields.io/badge/JWT-black?logo=jsonwebtokens&logoColor=white&style=for-the-badge" height="30" alt="JWT logo"/>
</div>

### End points:
<table>
	<thead>
		<tr>
			<td>Path</td>
			<td>Method</td>
			<td>Need auth (JWT)</td>
		</tr>
	</thead>
	<tbody> 
		<tr>
			<td>/api/user</td>
			<td>GET</td>
			<td>✖️</td>
		</tr>
		<tr>
			<td>/api/user/:id</td>
			<td>GET</td>
			<td>✖️</td>
		</tr>
		<tr>
			<td>/api/user/my-account</td>
			<td>GET</td>
			<td>✔️</td>
		</tr>
		<tr>
			<td>/api/user</td>
			<td>PUT</td>
			<td>✔️</td>
		</tr>
		<tr>
			<td>/api/user</td>
			<td>DELETE</td>
			<td>✔️</td>
		</tr>
		<tr>
			<td>/api/user/signup</td>
			<td>POST</td>
			<td>✖️</td>
		</tr>
		<tr>
			<td>/api/user/login</td>
			<td>POST</td>
			<td>✖️</td>
		</tr>
		<tr>
			<td>/api/user/refrsh</td>
			<td>POST</td>
			<td>✔️ <sup>for refresh access token</sup></td>
		</tr>
		<tr>
			<td>/api/user/jobSeeker</td>
			<td>GET</td>
			<td>✖️</td>
		</tr>
		<tr>
			<td>/api/user/jobSeeker/:seeker_id/experience</td>
			<td>GET</td>
			<td>✔️</td>
		</tr>
		<tr>
			<td>/api/user/jobSeeker/application</td>
			<td>GET</td>
			<td>✔️</td>
		</tr>
		<tr>
			<td>/api/user/jobSeekr/:hirer_id</td>
			<td>POST</td>
			<td>✔️</td>
		</tr>
		<tr>
			<td>/api/user/jobSeeker</td>
			<td>GET</td>
			<td>✖️</td>
		</tr>
		<tr>
			<td>/api/user/hirer</td>
			<td>GET</td>
			<td>✖️</td>
		</tr>
		<tr>
			<td>/api/user/hirer/:hirer_id/jobPost</td>
			<td>GET</td>
			<td>✖️</td>
		</tr>
		<tr>
			<td><b>JOBS</b></td>
			<td>----</td>
			<td>----</td>
		</tr>
	</tbody>
</table>
