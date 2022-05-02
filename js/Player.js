class Player {
  constructor() {
    this.money = 3000;
    this.level = 0;
    this.lives = 100;
  }

  addMoney(money) {
    this.money += money;
  }

  takeMoney(money) {
    if(this.money < money) {
      return false;
    }
    this.money -= money;
    return true;
  }

}