import { Event } from "../../bases/event";

export default Event.Create("ready", function(client) {
  console.log(`${client.user.username} is ready!`);
});