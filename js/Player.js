/**
 * Class representing the player
 */
class Player {
  /**
   * Creates a new player
   */
  constructor() {
    this.money = 3000;
    this.level = 0;
    this.lives = 100;
  }

  /**
   * Gives player money
   * @param {number} money How much money to give player 
   */
  addMoney(money) {
    this.money += money;
  }

  /**
   * Takes player's money
   * @param {number} money How much money to take 
   * @returns {boolean} true if player has enough money, false otherwise
   */
  takeMoney(money) {
    if(this.money < money) {
      return false;
    }
    this.money -= money;
    return true;
  }

}