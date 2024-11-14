import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { start } from "./server.js";
import { delay } from "./server.js";

// 전역변수
global.playerName = "";
global.passStage = false;//도망치기 성공시 스테이지 패스 여부
global.gold = 0; //스테이지마다 플레이어를 재할당 하다보니 문제가 많이 생겨서 전역변수로 뺐다
global.cheat = false; //테스트용
global.record = []; //기록보관
global.achievements = [];//업적보관
global.displayAchievements = []; //업적 바꾸기
global.maxDamage =0; //업적용 최대데미지 저장
global.maxGold =0; //업적용 최대골드 저장
global.maxUpgrade =5; //업적용 최고 공격력
class Player { //Player 클래스
  constructor(hp, lv, atk, amr, barrier, canIRunAway, sword) {
    this.hp = hp;//총 hp
    this.nowHp = hp; // 현재(전투중)hp
    this.lv = lv;
    this.atk = atk;
    this.amr = amr;
    this.barrier = barrier; // 방어성공여부
    this.canIRunAway = canIRunAway//도망기회
    this.sword = sword; //무기
  }

  attack(monster, logs) {
    // 플레이어의 공격
    if (monster.barrier === false) { //몬스터의 방어가 없다면
      const damage = Math.max(0, this.sword.atk + this.atk - monster.amr);  // 공격력 계산
      if(damage>maxDamage) maxDamage = damage;//최대데미지 업적
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
      if(damage>maxDamage) maxDamage = damage;//최대데미지 업적
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
      gold -= 30;
      return true;
    } else return false;
  }
}

class Sword { //플레이어의 무기 클래스
  constructor(atk) {
    this.atk = atk;
    this.probability = 6; //강화확률 10중 n
  }
}

class Monster { //몬스터 클래스
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

function displayStatus(stage, player, monster, sword1) { // 전투 중 상태창
  console.log(chalk.magentaBright(`\n========================================== Current Status ==========================================`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| ${playerName} Lv.${player.lv} ` +
      `| HP: ${player.nowHp} ` +
      `| ATK: ${player.atk + sword1.atk} ` +
      `| AMR: ${player.amr} `
    ) +
    chalk.redBright(
      `| ${monster.name} Lv.${monster.lv} ` +
      `| HP: ${monster.nowHp} ` +
      `| ATK: ${monster.atk} ` +
      `| AMR: ${monster.amr} `
    ),
  );
  console.log(chalk.magentaBright(`====================================================================================================\n`));
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
          passStage = true;
        } else {
          logs.push(chalk.red(`도망에 실패 했습니다!`));
        }
        player.canIRunAway = false; // 도망 시도 후에 false로 설정
      }
      break;
    case 'test'://승리 테스트용
      logs.push(chalk.redBright(`테스트입니다.`));
      gold = 500;
      cheat = true;
      break;

    case 'die': //패배 테스트용
      player.nowHp = 0;
      break;
    default:
      console.log(chalk.red(`1~4의 값만 입력하세요.`));
      return false;  // 유효하지 않은 입력을 받으면 false 반환
  }


  return true;  // 유효한 입력을 받으면 true 반환
}

const battle = async (stage, player, monster, sword1) => { //전투
  let logs = [];

  while (player.nowHp > 0 && monster.nowHp > 0) {
    console.clear();
    displayStatus(stage, player, monster, sword1);

    logs.forEach((log) => console.log(log));
    logs = [];  // 턴이 끝날 때마다 로그 초기화

    console.log(
      chalk.green(`\n1. 일반공격 2. 방어 3. 스킬 4. 도망`),
    );

    let isValidChoice = false;
    while (!isValidChoice) {

      isValidChoice = handleUserBattle(logs, player, monster); //유저가 1~4의 유효한 값을 넣을때까지 작동
    }

    if (cheat === true) {
      stage = 11;
      cheat = false;
      break;
    }

    if (passStage === true) { //도망치기를 성공했다면 스테이지 패스
      stage++;
      break;
    }

    // 몬스터가 체력이 0 이하일 때 승리 처리
    if (monster.nowHp <= 0) {
      logs.push(chalk.green(`플레이어의 승리입니다!`));
      gold += 50;  // 승리 시 골드 추가
      if(gold>maxGold) maxGold = gold;//최대골드 업적
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

const upgradePage = async (player, sword1, logs) => {

  let isValidChoice = false;

  while (!isValidChoice) {//1~2를 입력했는지 검증
    console.clear();
    logs.push(chalk.yellowBright(`=|=|=|=|=|=제련소=|=|=|=|=|=`));
    logs.push(chalk.yellowBright(`보유골드:${gold}`));
    logs.forEach(log => console.log(log));
    const upgradeChoice = readlineSync.question('1.강화하기(30골드) 2.나가기: ');
    switch (upgradeChoice) {
      case '1':
        await upgrade(player, sword1, logs);
        isValidChoice = true;
        break;
      case '2':
        isValidChoice = true;
        return true;
      default:
        logs.push(chalk.red(`1~2의 값만 입력하세요.`));
        break;
    }
  }
};

const upgrade = async (player, sword1, logs) => {
  if (gold >= 30) {
    const successProbability = Math.floor(Math.random() * 10) + 1;
    if (sword1.probability >= successProbability) {// 1~10중 sword1의 강화확률인 probability(8로 시작)보다 작으면 성공
      sword1.atk += 3; // 성공시 공격력 증가
      if(sword1.atk>maxUpgrade) maxUpgrade = sword1.atk;//최대강화 업적
      gold -= 30; // 플레이어 골드 감소
      if (sword1.probability !== 1) sword1.probability -= 1;// 강화확률 감소
      logs.push(chalk.blueBright(`강화에 성공했습니다! 무기의 공격력이 3 증가하여 ${sword1.atk}이 되었습니다.`));
    } else {
      if (sword1.atk > 3) {
        sword1.atk -= 3; // 실패시 공격력 감소
        gold -= 30; // 플레이어 골드 감소
        sword1.probability += 1; //강화확률 증가
        logs.push(chalk.redBright(`강화에 실패했습니다.무기의 공격력이 3 감소하여 ${sword1.atk}이 되었습니다.`));
      } else if (sword1.atk <= 3) {
        gold -= 30; // 플레이어 골드 감소
        sword1.probability += 1; //강화확률 증가
        logs.push(chalk.redBright(`강화에 실패했습니다.무기의 공격력이 3보다 작아서 더 이상 감소하지 않습니다.`));
      }

    }
  } else {
    logs.push(chalk.redBright(`강화할 골드가 부족합니다.`));
  }
  console.clear();
  logs.forEach(log => console.log(log));
  await delay(500);  // 2초 동안 로그 표시 후 이동
  logs.length = 0;
};

export async function startGame() {
  console.clear();
  let sword1 = new Sword(5);

  let stage = 1;

  while (stage <= 10) {
    let player = new Player(100 + stage * 10, stage, 15 + stage * 3, 5 + stage * 2, false, true, sword1); // hp, lv, atk, amr, barrier, canIRunAway, sword
    let monster = new Monster(`Monster ${stage}단계`, 180 + stage * 30, stage, 10 + stage * 2, 5 + stage, false);// name, hp, lv, atk, amr, barrier
    const isVictory = await battle(stage, player, monster, sword1);



    // 승리/패배 메시지 출력
    if (isVictory && !passStage) {
      console.log(chalk.green(`Stage ${stage}에서 승리하셨습니다!`));
    } else if (isVictory && passStage) {
      console.log(chalk.green("성공적으로 도망쳤습니다!"));
      passStage = false;
    } else {
      archive(playerName, stage - 1);//패배시 기록 저장
      saveAchievement(playerName, maxDamage,maxUpgrade,maxGold,achievements);
      console.log(chalk.red(`Stage ${stage}에서 패배하셨습니다.`));
      console.log(chalk.red(`게임 종료!`));
      gold = 0;
      break;
    }
    await delay(500); //다음 스테이지 전까지 텍스트를 읽을 수 있게 타임아웃2.5초
    // 스테이지 클리어 및 게임 종료 조건
    let isFinish = false;
    if (stage < 10) {
      while (!isFinish) { //강화
        let logs = [];
        isFinish = await upgradePage(player, sword1, logs);
        console.clear();
        logs.forEach((log) => console.log(log));
      }
    }



    stage++;
    if (stage === 11) {
      gold = 0;
      archive(playerName, stage - 1);
      saveAchievement(playerName, maxDamage,maxUpgrade,maxGold,achievements);
      console.log(chalk.yellowBright(`모든 스테이지를 클리어했습니다! 곧 게임이 다시 시작됩니다.`));

    }
  }
  start();
}


function archive(playerName, stage) {
  // 10개의 정보가 다 찬 경우, 가장 낮은 스테이지와 비교
  if (record.length >= 10) {
    // 가장 낮은 스테이지보다 입력 스테이지가 높을 때만 추가
    const minStage = record[record.length - 1].stage;
    if (stage <= minStage) {
      console.log(`${playerName}의 스테이지가 낮아 저장되지 않았습니다.`);
      return;
    } else {
      record.pop(); // 가장 낮은 스테이지를 제거
    }
  }

  // 새로운 정보를 삽입할 위치 찾기
  const index = record.findIndex(info => info.stage < stage);//record에서 순차적으로 넣으려는 정보의 stage보다 낮은 stage가 있는지 탐색 없으면 -1반환
  if (index === -1) {
    record.push({ playerName, stage }); // 가장 낮은 자리에 추가
  } else {
    record.splice(index, 0, { playerName, stage }); // 적절한 자리에 삽입
  }

  // 배열을 스테이지 내림차순, 이름 오름차순으로 정렬
  record.sort((a, b) => {
    if (b.stage === a.stage) {
      return a.name.localeCompare(b.name); // 스테이지가 같으면 이름을 사전순으로 비교
    }
    return b.stage - a.stage; // 스테이지가 다르면 내림차순으로 정렬
  });

  console.log(`플레이어 ${playerName}의 스테이지 ${stage} 정보가 저장되었습니다.`);
}


function saveAchievement(playerName, maxDamage,maxUpgrade,maxGold,achievements) {
  let playerAchievements = {
    PlayerName: playerName,
    Achievements: []
  };

  // 업적을 배열에 추가
  if (maxDamage >= 20) playerAchievements.Achievements.push("[어디서 좀 치던 사람]");
  if (maxDamage >= 40) playerAchievements.Achievements.push("[힘세고 강한 사람]");
  if (maxDamage >= 60) playerAchievements.Achievements.push("[짱쎈사람]");
  if (maxDamage >= 80) playerAchievements.Achievements.push("[진 심 펀 치]");
  if (maxUpgrade >= 8) playerAchievements.Achievements.push("[강화어린이]");
  if (maxUpgrade >= 14) playerAchievements.Achievements.push("[강화고수]");
  if (maxUpgrade >= 17) playerAchievements.Achievements.push("[좋은 운을 이런데 쓴 사람]");
  if (maxUpgrade >= 20) playerAchievements.Achievements.push("[이게되네]");
  if (maxGold >= 100) playerAchievements.Achievements.push("[강화를 까먹은 사람]");
  if (maxGold >= 200) playerAchievements.Achievements.push("[강화를 안하는 사람]");
  if (maxGold >= 300) playerAchievements.Achievements.push("[저축의 신]");
  if (maxGold >= 500) playerAchievements.Achievements.push("[절약왕]");

  // playerAchievements 객체를 achievements 배열에 추가
  achievements.push(playerAchievements);
}
