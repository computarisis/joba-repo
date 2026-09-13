
# Joba
---

This application allows people to register and track job applications; users can quickly create, update,  and delete records, which include relevant data like application date, status, job site, compensation range, etc.

**Live demo:** https://joba-repo.vercel.app/

Note the app may take a minute to load since it's deployed on the free tier.

We use a serverless setup for the backend REST API. The PostgreSQL database contains two tables, one to track users, and another one to track applications. We use an index to optimize searching for application entries associated with a user when paginating.  We use cookies and JWTs for auithentication; since users can log out and reset their  password,  we use Redis to blacklist affected tokens. While JWTs were intended to be self-contained, blacklisting becomes necessary to avoid incosistent service behavior. Redis is also used to record registration tokens via email when validating a register request. The main convenience of Redis for this uses is that, since we can set an appropriate TTL, the presence or not in the cache signals the validity of the token. Caches are very fast, so this is the optimal choice over an approach that would involve writing to  database itself.

The frontent makes use of RDC to ensure optimistic rendering —which essentially renders changes in the UI before receiving confirmation from the server. We use pagination with different options for the user to view the existing entries; this is done by keeping track of the latest cursor sent by the server — by invariant, the cursor value sequence is progessive. We compute  local page view using the cache if sufficient entries are present, and load from the server otherwise.

## Primary stack 

### Backend
- Express
- TypeScript
- PostgreSQL
- Redis

### Frontend
- React
- React Query
- Reactive Data Client
- Tailwind

## How to run locally

1. Clone the repo
2. Run `cp .env.example .env` both in the server folder and at the project root; then fill in the environment variable values
3. Run `npm install` in both the client and server folders
4. Run `docker compose up` (ensure the Docker app is running first)
5. Start the server and client separately using `npm run dev`

## Desirable  extensions to the project 

A couple of ideas:

1. We add a browser extension that lets the user quickly add jobs from any application website on a single click; the user would prompted to install the extension when registering. This would imporove usability.

2. There are numerous premium features that could be develop if we integrate AI into the capabilities of Joba. For instance, we could add an extension that lets the user quickly import an interview transcript, which could then be associated with a job application, and be analyzed based on the outcomes or sentiment surveys  to refine the interview process for the candidate. This project would be particularly suited for this precisely because it'd keep track of a large  enough sample of applications.

## **Testing (AI assisted)**

We instructed an AI to generate the boilerplate for these semi-automated integration tests. They cover all endpoints of the backend. The code is designed to test in your local environment.

You need to have an email that can be checked; set the email in `integration.sh`. Then, from root, do :

```text
chmod +x testing/integration.sh 
./testing/integration.sh
```
The tests will only prompt for input when validating the email related features.
