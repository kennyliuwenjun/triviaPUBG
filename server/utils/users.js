class Users {
  //ready: 0 - not ready
  //       1 - ready
  //       2 - dead

  constructor () {
    this.users = [];
  }
  addUser (id, name, room, ready, answer) {
    const user = {id, name, room, ready, answer};
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
  // setUserReady (id){
  //   this.getUser(id).ready = 1;
  // }
  checkAllReady(room){
    for(let user in this.users){
      if(this.users[user].room === room && this.users[user].ready === 0) return false;
    }
    return true;
  }
  initializeQuestion(room){
    for(let user in this.users){
      if(this.users[user].room === room && this.users[user].ready !== 2) this.users[user].ready = 0;
    }
  }
  checkAnswer(room, answer){
    let count = 0;
    for(let user in this.users){
      if(this.users[user].room === room && this.users[user].answer === answer && this.users[user].ready != 2){
        count++;
        this.users[user].ready = 0;
      }else {
        this.users[user].ready = 2;
      };
    }
    return count;
  }
  getWinner(room){
    for(let user in this.users){
      if(this.users[user].room === room && this.users[user].ready === 0) return this.users[user].name;
    }
  }
  resetReady(room){
    for(let user in this.users){
      if(this.users[user].room === room) this.users[user].ready = 0;
    }
  }
  getRoomUsers(room){
    return this.users.filter(user => user.room === room);
  }
}

module.exports = {Users};
