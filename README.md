# Readme

This is a scheduling app built on ruby+sinatra on the backend and typescript_react on the frontend.  I've included a production build of the frontend in `/build` to make it easier to test out if you don't have node set up on your local machine.

## Prereqs

You'll need ruby installed locally to run this.  For frontend development you'll need node installed, but that's not necessary just to run it.

## Quick Start

In one terminal tab, launch the backend server on port 4567:

```
cd backend
bundle install
ruby server
```

In another terminal tab, launch a frontend server on port 3000:

```
cd frontend/build
python -m SimpleHTTPServer 3000
```

(This is just a simple command to server everything in the current folder on port 3000)

Then go to `http://localhost:3000/` to see the app.

## Frontend dev

If you want to mess around with frontend stuff, you'll need node installed.  Then run `npm install` and `npm start` from within the frontend directory.

If you run into trouble, this is pretty much a stock install of `npx create-react-app . --typescript`, so googling around the `create-react-app` tool should be useful.

## Design notes

It sounds like this project is a prelude to a session where I talk through the code, so I won't go into too much detail.  So, briefly, what I cut from scope in the interest of time:

- Multiple weeks.  I have it just displaying the next 7 days.  It shouldn't be *too* hard to add this.
- Real backend persistence.  In the interest of not making you spin up a database locally, I'm just using a flat file.
- Exclude existing appointments from coach availability.
- Session management / multiple users
- Testing.  I'm dealing with timezone logic without automated tests, which is the coding equivalent of juggling lit fireworks: not a good idea in real life.
- Mobile-friendly UI.
- A lot of styling.  I kept the CSS pretty minimal, since that's a rabbit-hole you could spend a long time going down.
- Error handling: on malformed csvs, on api errors, on network errors, etc etc.
