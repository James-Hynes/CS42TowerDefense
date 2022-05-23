/**
 * Class representing the player
 */
class Player {
  /**
   * Creates a new player
   */
  constructor(m, l, li) {
    this.money = m || 2000;
    this.level = l || 0;
    this.lives = li || 100;
    this.max_lives = 150;

    this.display_money = m || 3000;
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

  /**
   * Takes player's lives
   * @param {number} lives How many lives to take
   * @returns {boolean} true if player lives false if player dies
   */
  takeLives(lives) {
    if(this.lives <= lives) {
      this.lives=0;
      return false;
    }
    this.lives -= lives;
    return true;
  }

  /**
   * Gives lives up to the player's maximum capacity
   * @param {number} lives lives to add
   */
  addLives(lives) {
    this.lives = Math.min(this.lives+lives, this.max_lives);
  }

}