const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const rawdata = fs.readFileSync('datas.json');
const Data = JSON.parse(rawdata);

var World = Data.world;
var Players = Data.players;

var Admin = "374929883698036736"; //Feel free to change this to your id discord hack week judges! You can create rooms and stuff to continue the adventure if you want!

/** VARIABLES */

/** GAME FUNCTIONS */
var checkForPlayer = function(id){
    for(var i = 0;i < Players.length;i ++){
        if(Players[i].id === id){
            return i;
        }
    }
    return -1;
};
var makePlayer = function(message, username){
    Players.push({
        room: "hub",
        username: username,
        id: message.author.id,
        health: 20,
        inv: [],
        joined: true,
    })
};

/** WORLD BUILDER COMMANDS */
var createRoom = function(message, args){ //c?croom <name>
    if(args[0] === undefined || args[0] === ""){
        message.channel.send("Please input a name for this room");
        return;
    }
    World.push({
        name: args[0],
        exits: [],
        id: World.length,
        descr: "example"
    })
    message.channel.send("Created room with name \"" + args[0] + "\"");
};
var findRoom = function(name){
    for(var i = 0;i < World.length;i ++){
        if(World[i].name === name){
            return i;
        }
    }
    return -1;
};
var editDescription = function(message, args){
    if(args[0] === undefined || args[0] === ""){
        message.channel.send("Please choose the room name");
        return;
    }
    if(findRoom(args[0]) === -1){
        message.channel.send("That room doesn't exist!");
        return;
    }
    if(args[1] === undefined || args[1] === ""){
        message.channel.send("Enter a description!");
        return;
    }
    var thedescr = "";
    for(var i = 1;i < args.length;i ++){
        thedescr +=args[i];
        if(i < args.length-1){ thedescr +=" ";}
    }
    World[findRoom(args[0])].descr = thedescr;
    message.channel.send("Room \"" + args[0] + "\" has been updated with description \"" + thedescr + "\"");
};
var createExit = function(message, args){
    if(args[0] === undefined || args[0] === ""){
        message.channel.send("Please choose the room name");
        return;
    }
    if(findRoom(args[0]) === -1){
        message.channel.send("That room doesn't exist!");
        return;
    }
    if(findRoom(args[1]) === -1){
        message.channel.send("That room also doesn't exist");
        return;
    }
    var room1 = World[findRoom(args[0])];
    var room2 = World[findRoom(args[1])];

    room1.exits.push(
        {
            name: room2.name,
            id: room2.id,
        }
    );
    message.channel.send("Successfully made an exit going from " + room1.name + " to " + room2.name + "!");
};
var createPassword = function(message, args){
    if(args[0] === undefined || args[0] === ""){
        message.channel.send("Please choose the room to edit");
        return;
    }
    if(findRoom(args[0]) === -1){
        message.channel.send("That room doesn't exist!");
        return;
    }
    if(args[1] === undefined || args[1] === ""){
        message.channel.send("Please choose the password");
        return;
    }
    if(args[2] === undefined || args[2] === ""){
        message.channel.send("Please choose the room to send the user to");
        return;
    }
    if(findRoom(args[2]) === -1){
        message.channel.send("That room doesn't exist!");
        return;
    }
    var passcode = args[1];
    var room1 = World[findRoom(args[0])];
    var room2 = World[findRoom(args[2])];

    room1.passcode = passcode;
    room1.rewardroom = room2.name;
    message.channel.send("Password set for room \"" + room1.name + "\", password set to " +  room1.passcode + " and the reward room will be " + room2.name);
};
/** INTERACTION COMMANDS */
var StartCommand = function(message, args){
    if(args[0] === undefined || args[0] === ""){
        message.channel.send("perhaps you should pick a nickname, for example `c?start nickname`");
        return;
    }
    if(checkForPlayer(message.author.id) !== -1){
        message.channel.send("Looks like you already have a user named " + Players[checkForPlayer(message.author.id)].username + "! Use c?join to login if you haven't!");
        return;
    }
    makePlayer(message, args.join(' '));
    message.channel.send("Seems like a new player named " + args.join(' ') + ", decided to jump into the cave! Which they now cannot get out of! You may join and exit at anytime using c?join or c?exit, I will walk you thru the rest, start with c?look");
};
var BackupCommand = function(){
    var theData = {world:World,players:Players};
    var stringData = JSON.stringify(theData);
    fs.writeFile('datas.json', stringData, (err) => {
        if(err){throw err;}
        const rawdata = fs.readFileSync('datas.json');
        const Data = JSON.parse(rawdata);

        World = Data.world;
        Players = Data.players;
    });
};
var LookCommand = function(message, args){
    if(checkForPlayer(message.author.id) === -1){
        message.channel.send("You'll have to make a user first before you can use this command! Use `c?start <username>` to create a user!");
        return;
    }
    var Ps = Players[checkForPlayer(message.author.id)];
    var theroom = World[findRoom(Ps.room)];
    message.channel.send("**You take a look at your surroundings...**\n" + theroom.descr);
};
var GoCommand = function(message, args){
    if(checkForPlayer(message.author.id) === -1){
        message.channel.send("You'll have to make a user first before you can use this command! Use `c?start <username>` to create a user!");
        return;
    }
    var Ps = Players[checkForPlayer(message.author.id)];
    var theroom = World[findRoom(Ps.room)];
    if(args[0] === undefined || args[0] === ""){
        message.channel.send("Where do you wanna go?");
        return;
    }
    for(var i = 0;i < theroom.exits.length;i ++){
        if(theroom.exits[i].name === args[0].toLowerCase()){
            Ps.room = theroom.exits[i].name;
            message.channel.send("You have arrived at \"" + Ps.room + "\"");
            return;
        }
    }
    message.channel.send("You can't travel there from here!");
}
var PasswordCommand = function(message, args){
    if(checkForPlayer(message.author.id) === -1){
        message.channel.send("You'll have to make a user first before you can use this command! Use `c?start <username>` to create a user!");
        return;
    }
    var Ps = Players[checkForPlayer(message.author.id)];
    var theroom = World[findRoom(Ps.room)];
    if(theroom.passcode === undefined  || theroom.passcode === ""){
        message.channel.send("This room doesn't have a passcode");
        return;
    }
    if(args[0] === undefined || args[0] === ""){
        message.channel.send("You need to enter in the password!");
        return;
    }
    if(args[0] !== theroom.passcode.toLowerCase()){
        message.channel.send("That ain't correct! Try again!");
        return;
    }
    Ps.room = theroom.rewardroom;
    message.channel.send("Password correct! You have now arrived in the destination room!");
};
var RestartCommand = function(message){
    if(checkForPlayer(message.author.id) === -1){
        message.channel.send("You'll have to make a user first before you can use this command! Use `c?start <username>` to create a user!");
        return;
    }
    var Ps = Players[checkForPlayer(message.author.id)];
    Ps.room = "hub";
    message.channel.send("You have restarted your progress!");
};
/** CLIENT STUFFS */
client.on('ready', () => {
    console.log("Discord Cave has started up! Vroom!");
    setInterval(() => {
        BackupCommand();
        console.log("Backed up successfully!");
    }, 60000);
});
client.on('message', message => {
    if(message.author.bot){ return;}
    if(message.channel.type === "dm"){ return;}
    var theMessage = message.toString();
    if(theMessage.startsWith("c?")){
        theMessage = theMessage.slice(2);
        theMessage = theMessage.split(" ");
        var nameCommand = theMessage[0];
        theMessage.splice(0, 1);
        if(nameCommand === "start"){
            StartCommand(message, theMessage);
        }
        if(nameCommand === "look"){
            LookCommand(message, theMessage);
        }
        if(nameCommand === "go"){
            GoCommand(message, theMessage);
        }
        if(nameCommand === "passcode"){
            PasswordCommand(message, theMessage);
        }
        if(nameCommand === "restart"){
            RestartCommand(message, theMessage);
        }

        //admin commands
        if(message.author.id === Admin){
            
            if(nameCommand === "croom"){
                createRoom(message, theMessage);
            }
            if(nameCommand === "cdescr"){
                editDescription(message, theMessage);
            }
            if(nameCommand === "cexit"){
                createExit(message, theMessage);
            }
            if(nameCommand === "cpasscode"){
                createPassword(message, theMessage);
            }
        }
    }
});

/** CLIENT LOGINS */
client.login("YOUR TOKEN HERE!"); //Token go here!