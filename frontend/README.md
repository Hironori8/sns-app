# SNS Application Frontend

This is the frontend for a social networking application built with Next.js, Mantine UI, and TypeScript.

## Requirements

- Node.js 18.18.0 or higher (Node 20+ is recommended)
- npm 7.x or higher

## Setup

First, make sure you have the correct Node.js version installed:

```bash
# Using Volta
volta install node@20
volta pin node@20

# OR using nvm
nvm use
```

Then install the dependencies:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Features

- Modern UI with Mantine components
- Real-time updates with Socket.IO
- User authentication with JWT
- Post creation and interaction

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
