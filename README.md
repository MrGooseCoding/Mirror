# Mirror
Mirror is a multiplayer, cross-device compatible minigames website that's modular so you can upload and code your own games easily.
It's place to play online games with your friends. Create a room, invite people, and start playing!

![Intuitive and Multiplayer](/webpage/src/assets/videos/IntuitiveFlow.gif)

## Awards
Mirror is officially the winner of the **First edition of Loyola's University Videogame Academy Awards**

## Instalation
You must have Node.js installed.

Open your terminal and navigate to the `webpage/` folder. There, execute the following command:

```
npm install
```

And then:

```
npm run build
```

After that, go to the `server/` folder and run:
```
npm install
```

Now you're ready to run the app.

### Running the app
You have two options to run the app. You can set the port in the `server/app.js` file by changing the `port` variable. If you don't, Mirror will by default run on port 3000

#### Production
On your `server/` folder, run:

```
node app.js
```

It should show an alert saying the server is running on the port you specified.

#### Development
On your `server/` folder, run:

```
npm run start
```

Which should start a nodemon instance of the server.
