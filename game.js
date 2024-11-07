import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor(hp,lv,atk,amr) {
    this.hp = 100;
    this.lv = 1;
    this.atk = 5;
    this.amr = 1;
  }

  attack() {
    // 플레이어의 공격
    // 몬스터의 hp감소
  }
}

class Monster {
  constructor(hp,lv,atk,amr) {
    this.hp = 100;
    this.lv = 1;
    this.atk = 5;
    this.amr = 1;
  }

  attack() {
    // 몬스터의 공격
    // 플레이어의 hp감소
  }
}


function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| ${playerName} Lv.${player.lv} `,
    ) +
    chalk.redBright(
      `| 이름 lv hp |`,
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while(player.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 아무것도 하지않는다.`,
      ),
    );
    const choice = readlineSync.question('What is your choice?');

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));
  }
  
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건

    stage++;
  }
}