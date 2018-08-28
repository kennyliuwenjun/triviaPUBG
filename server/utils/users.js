class Users {
  //ready: 0 - not ready
  //       1 - ready
  //       2 - dead

  constructor () {
    this.users = [];
  }
  addUser (id, name, room, ready) {
    const user = {id, name, room, ready};
    this.users.push(user);
    return user;
  }
  removeUser (id) {
    const user = this.getUser(id);

    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }

    return user;
  }
  getUser (id) {
    return this.users.filter((user) => user.id === id)[0]
  }
  getUserList (room) {
    return this.users.filter((user) => user.room === room);
  }
  setUserReady (id){
    this.getUser(id).ready = true;
  }
  checkAllReady(room){
    for(let user in this.users){
      if(this.users[user].room === room && this.users[user].ready === 0) return false;
    }
    return true;
  }
}

module.exports = {Users};
