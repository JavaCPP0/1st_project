import chalk from 'chalk';
import readlineSync from 'readline-sync';

// 전역변수
global.playerName = "";
global.passStage = false;
export class Player { //Player 클래스
  constructor(hp, lv, atk, amr, barrier, canIRunAway, sword) {
    this.hp = hp;//총 hp
    this.nowHp = hp; // 현재(전투중)hp
    this.lv = lv;
    this.atk = atk;
    this.amr = amr;
    this.gold = 0;
    this.barrier = barrier; // 방어성공여부
    this.canIRunAway = canIRunAway//도망기회
    this.sword = sword; //무기

  }

  attack(monster, logs) {
    // 플레이어의 공격
    if (monster.barrier === false) { //몬스터의 방어가 없다면
      const damage = Math.max(0, this.sword.atk + this.atk - monster.amr);  // 공격력 계산
      monster.nowHp -= damage;  // 몬스터의 체력 감소
      logs.push(`피해를 ${damage}만큼 입혀 ${monster.name}의 체력이 ${monster.nowHp} 남았습니다.`);
    } else if (monster.barrier === true) { // 몬스터의 방어가 있다면
      logs.push(`${monster.name}가 방어에 성공했습니다!`);
      monster.barrier = false; //방어를 사용했으니 없애기
    }
  }

  getBarrier() { // 방어 선택시 1/2확률로 방어막 획득 
    const randomPlayerBarrier = Math.floor(Math.random() * 2) + 1;
    if (randomPlayerBarrier % 2 === 0) this.barrier = true;
  }

  useSkill(monster, logs) { //스킬사용: 메커니즘은 일반공격과 같으나 1/3확률로 빗나감
    const randomPlayerSkill = Math.floor(Math.random() * 3) + 1; // 2/3 확률설정
    if (randomPlayerSkill % 2 === 1 && monster.barrier === false) { //맞췄고 방어막이 없다면
      const damage = (this.sword.atk + this.atk) * 2;  // 공격력 계산
      monster.nowHp -= damage;  // 몬스터의 체력 감소
      logs.push(`스킬 적중! 피해를 ${damage}만큼 입혀 ${monster.name}의 체력이 ${monster.nowHp} 남았습니다.`);
    } else if (randomPlayerSkill % 2 === 1 && monster.barrier === true) { //맞췄지만 방어막이 있다면
      logs.push(`${monster.name}가 방어에 성공했습니다!`);
      monster.barrier = false;
    } else if (randomPlayerSkill % 2 === 0) { //못맞췄지롱
      logs.push(`스킬을 맞추지 못했습니다..!`);
    }
  }

  runAway() {
    const ranRunAway = Math.floor(Math.random() * 3) + 1;
    if (ranRunAway === 1) { // 1/3확률로 도망
      this.canIRunAway = false;
      this.gold -=30;
      return true;
    } else return false;
  }
}

export class Sword { //플레이어의 무기 클래스
  constructor(atk) {
    this.atk = atk;
  }
}

export class Monster { //몬스터 클래스
  constructor(name, hp, lv, atk, amr, barrier) {
    this.name = name;
    this.hp = hp;
    this.nowHp = hp;
    this.lv = lv;
    this.atk = atk;
    this.amr = amr;
    this.barrier = barrier;
  }

  monsterUseSkill(player, monster, logs) {
    const randomMonsterSkill = Math.floor(Math.random() * 3) + 1; // 2/3 확률로 스킬 사용
    // 몬스터 스킬이 적중하고 플레이어가 방어막을 가지고 있지 않으면
    if (randomMonsterSkill % 2 === 1 && player.barrier === false) {
      logs.push(chalk.green(`몬스터가 스킬사용을 선택했습니다.`));
      const damage = monster.atk * 2; // 몬스터의 공격력 * 2 만큼 피해
      player.nowHp -= damage; // 플레이어의 체력 감소
      logs.push(`${monster.name}가 스킬을 사용해 ${damage}의 피해를 입혔습니다. 당신의 체력은 ${player.nowHp} 남았습니다.`);
    }
    // 몬스터 스킬이 적중했지만 플레이어가 방어막을 가지고 있으면
    else if (randomMonsterSkill % 2 === 1 && player.barrier === true) {
      logs.push(chalk.green(`몬스터가 스킬사용을 선택했습니다.`));
      logs.push(`당신이 방어에 성공했습니다!`);
      player.barrier = false; // 방어막을 소모
    }
    // 몬스터 스킬이 빗나갔을 경우
    else if (randomMonsterSkill % 2 === 0) {
      logs.push(`몬스터의 스킬이 빗나갔습니다!`);
    }
  }

  randomAttack(player, logs) { //랜덤으로 각각 50%,25%,25%로 선택 메커니즘은 플레이어와 같음
    const randomChoice = Math.floor(Math.random() * 8) + 1;

    switch (randomChoice) {
      case 1: case 2: case 3: case 4:
        if (player.barrier === false) {
          logs.push(chalk.green(`몬스터가 일반공격을 선택했습니다.`));
          const damage = Math.max(0, this.atk - player.amr);  // 플레이어의 방어력을 고려한 피해 계산 (0이상)
          player.nowHp -= damage;  // 플레이어의 체력 감소
          logs.push(`${this.name}가 피해를 ${damage}만큼 입혀 당신의 체력이 ${player.nowHp} 남았습니다.`);
        } else if (player.barrier === true) {
          logs.push(chalk.green(`몬스터가 일반공격을 선택했습니다.`));
          logs.push(`당신이 방어에 성공했습니다!`);
          player.barrier = false;
        }
        break;
      case 5: case 6:
        logs.push(chalk.green(`몬스터가 방어를 선택했습니다.`));
        if (randomChoice % 2 === 0) this.barrier = true;
        break;
      case 7: case 8:
        this.monsterUseSkill(player, this, logs);
        break;
    }
  }
}

function displayStatus(stage, player, monster) { //전투중 상태창
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
      player.getBarrier();
      monster.randomAttack(player, logs);
      break;
    case '3':
      logs.push(chalk.green(`스킬사용을 선택하셨습니다.`));
      player.useSkill(monster, logs);
      monster.randomAttack(player, logs);
      break;
    case '4':

    if (!player.canIRunAway) { // 이미 시도한 경우
      logs.push(chalk.red(`이미 도망을 시도했습니다! 싸워야만 합니다!`));
    } else {
      logs.push(chalk.green(`도망을 선택하셨습니다.`));

      if (player.runAway()) {
        logs.push(chalk.green("성공적으로 도망쳤습니다!"));
        passStage = true;
      } else {
        logs.push(chalk.red(`도망에 실패 했습니다!`));
      }
      player.canIRunAway = false; // 도망 시도 후에 false로 설정
    }
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

    if (passStage === true) {
      stage ++;
      break;
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
    let player = new Player(100 + stage * 10, stage, 15 + stage * 3, 5 + stage * 2, false, true, sword1);
    let monster = new Monster(`Monster ${stage}단계`, 100 + stage * 20, stage, 10 + stage * 2, 5 + stage, false);
    const isVictory = await battle(stage, player, monster);

    

    // 승리/패배 메시지 출력
    if (isVictory) {
      console.log(chalk.green(`Stage ${stage}에서 승리하셨습니다!`));
    } else {
      console.log(chalk.red(`Stage ${stage}에서 패배하셨습니다.`));
      console.log(chalk.red(`게임 종료!`));
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 2500)); //다음 스테이지 전까지 텍스트를 읽을 수 있게 타임아웃2.5초
    // 스테이지 클리어 및 게임 종료 조건
    stage++;
    if (stage === 11) {
      console.log(chalk.yellowBright(`모든 스테이지를 클리어했습니다!`));
    }
  }
}
