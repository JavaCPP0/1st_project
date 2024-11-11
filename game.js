import chalk from 'chalk';
import readlineSync from 'readline-sync';

// 전역변수
global.playerName = "";
export class Player {
  constructor(hp, lv, atk, amr, barrier, sword) {
    this.hp = hp;
    this.nowHp = hp;
    this.lv = lv;
    this.atk = atk;
    this.amr = amr;
    this.gold = 0;
    this.barrier = barrier;
    this.sword = sword;
  }

  attack(monster, logs) {
    // 플레이어의 공격
    const damage = Math.max(0, this.sword.atk + this.atk - monster.amr);  // 공격력 계산
    monster.nowHp -= damage;  // 몬스터의 체력 감소
    logs.push(`${monster.name}의 체력이 ${monster.nowHp} 남았습니다.`);
  }
}

export class Sword {
  constructor(atk) {
    this.atk = atk;
  }
}

export class Monster {
  constructor(name, hp, lv, atk, amr, barrier) {
    this.name = name;
    this.hp = hp;
    this.nowHp = hp;
    this.lv = lv;
    this.atk = atk;
    this.amr = amr;
    this.barrier = barrier;
  }

  randomAttack(player, logs) {
    const randomChoice = Math.floor(Math.random() * 8) + 1;

    switch (randomChoice) {
      case 1: case 2: case 3: case 4:
        logs.push(chalk.green(`몬스터가 일반공격을 선택했습니다.`));
        const damage = Math.max(0, this.atk - player.amr);  // 플레이어의 방어력을 고려한 피해 계산
        player.nowHp -= damage;  // 플레이어의 체력 감소
        logs.push(`${this.name}의 일반공격! 당신의 체력이 ${player.nowHp} 남았습니다!`);
        break;
      case 5: case 6:
        logs.push(chalk.green(`몬스터가 방어를 선택했습니다.`));
        break;
      case 7: case 8:
        logs.push(chalk.green(`몬스터가 스킬사용을 선택했습니다.`));
        break;
    }
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| ${playerName} Lv.${player.lv} ` +
      `| HP: ${player.nowHp}`,
    ) +
    chalk.redBright(
      `| ${monster.name} Lv.${monster.lv} ` +
      `| HP: ${monster.nowHp}`,
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

// 유저 입력을 받아 처리하는 함수
function handleUserBattle(logs, player, monster) {
  const choice = readlineSync.question('insert 1~4: ');

  switch (choice) {
    case '1':
      logs.push(chalk.green(`일반공격을 선택하셨습니다.`));
      player.attack(monster, logs);
      monster.randomAttack(player, logs);
      break;
    case '2':
      logs.push(chalk.green(`방어를 선택하셨습니다.`));
      monster.randomAttack(player, logs); //테스트용
      break;
    case '3':
      logs.push(chalk.green(`스킬사용을 선택하셨습니다.`));
      break;
    case '4':
      logs.push(chalk.green(`도망을 선택하셨습니다.`));
      break;
    default:
      logs.push(chalk.red(`1~4의 값만 입력하세요.`));
      return false;  // 유효하지 않은 입력을 받으면 false 반환
  }


  return true;  // 유효한 입력을 받으면 true 반환
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.nowHp > 0 && monster.nowHp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));
    logs = [];  // 턴이 끝날 때마다 로그 초기화

    console.log(
      chalk.green(`\n1. 일반공격 2. 방어 3. 스킬 4. 도망`),
    );

    let isValidChoice = false;
    while (!isValidChoice) {
      isValidChoice = handleUserBattle(logs, player, monster);
    }

    // 몬스터가 체력이 0 이하일 때 승리 처리
    if (monster.nowHp <= 0) {
      logs.push(chalk.green(`플레이어의 승리입니다!`));
      player.gold += 50;  // 승리 시 골드 추가
      break;  // 전투 종료
    }

    // 플레이어가 체력이 0 이하일 때 패배 처리
    if (player.nowHp <= 0) {
      logs.push(chalk.red(`플레이어가 패배했습니다.`));
      break;  // 전투 종료
    }
  }

  console.clear();
  logs.forEach((log) => console.log(log));

  // 승리 여부를 반환
  return player.nowHp > 0;
};

export async function startGame() {
  console.clear();
  let sword1 = new Sword(5);

  let stage = 1;

  while (stage <= 10) {
    let player = new Player(100 + stage * 10, stage, 15 + stage * 3, 5 + stage * 2, false, sword1);
    let monster = new Monster(`Monster ${stage}단계`, 100 + stage * 20, stage, 15 + stage, 5 + stage, false);
    const isVictory = await battle(stage, player, monster);

    // 승리/패배 메시지 출력
    if (isVictory) {
      console.log(chalk.green(`Stage ${stage}에서 승리하셨습니다!`));
    } else {
      console.log(chalk.red(`Stage ${stage}에서 패배하셨습니다.`));
      console.log(chalk.red(`게임 종료!`));
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
    // 스테이지 클리어 및 게임 종료 조건
    stage++;
  }
}
