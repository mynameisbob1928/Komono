import { Event } from "../../bases/event";

export default Event.Create({
  name: "ready",
  type: "ready",
  async callback(client) {
    console.log(`Logged in as ${client.user}`);
  }
});