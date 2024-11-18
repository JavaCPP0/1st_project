import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { startGame } from "./game.js";


async function displayArchive() {
    console.clear();
    console.log(chalk.yellow('*====*====* Game Archive *====*====*'));
    if (record.length === 0) { //기록있는지 검사
        console.log(chalk.red('아직 기록이 없습니다.'));
    } else {
        record.forEach((record, index) => {
            console.log(chalk.greenBright(`${index + 1}. 이름: ${record.playerName}, 스테이지: ${record.stage}`)); //기록 하나씩 출력
        });
    };
    console.log(chalk.yellow('*====*====*====*====*====*====*====*'));
    console.log(chalk.green('1을 입력하면 로비로 돌아갑니다.'));
    // 사용자 입력을 기다리고, '1'을 입력하면 로비로 돌아가기
    const choice = readlineSync.question('Your choice: ');

    if (choice === '1') {
        displayLobby(); // 1을 누르면 로비로 이동
        handleUserInput();//게임 시작
    } else {
        console.log('잘못된 입력입니다 나가시려면 1을 눌러주세요.');
        await delay(1000);
        displayArchive(); // 잘못된 입력이 들어오면 다시 아카이브 화면을 표시
    }
}

async function displayAchievement() {
    console.clear();
    console.log(chalk.yellow('*====*====*====*====*====*====*====*====*====*====*====* Players Achievements *====*====*====*====*====*====*====*====*====*====*===*'));
    if (achievements.length === 0) { //기록있는지 검사
        console.log(chalk.red('아직 기록이 없습니다.'));
    } else {
        achievements.forEach((achievements, index) => {
            console.log(chalk.greenBright(`${index + 1}. 이름: ${achievements.PlayerName}, 달성업적: ${achievements.Achievements}`)); //기록 하나씩 출력
        });
    };
    console.log(chalk.yellow('*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*====*'));
    console.log(chalk.green('1을 입력하면 로비로 돌아갑니다.'));
    // 사용자 입력을 기다리고, '1'을 입력하면 로비로 돌아가기
    const choice = readlineSync.question('Your choice: ');

    if (choice === '1') {
        displayLobby(); // 1을 누르면 로비로 이동
        handleUserInput();//게임 시작
    } else {
        console.log('잘못된 입력입니다 나가시려면 1을 눌러주세요.');
        await delay(1000);
        displayAchievement(); // 잘못된 입력이 들어오면 다시 업적 화면을 표시
    }
}




// 로비 화면을 출력하는 함수
function displayLobby() {
    console.clear();

    // 타이틀 텍스트
    console.log(
        chalk.cyan(
            figlet.textSync('Hello guys!', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );

    // 상단 경계선
    const line = chalk.magentaBright('='.repeat(50));
    console.log(line);

    // 게임 이름
    console.log(chalk.yellowBright.bold('CLI 게임에 오신것을 환영합니다!'));

    // 설명 텍스트
    console.log(chalk.green('옵션을 선택해주세요.'));
    console.log();

    // 옵션들
    console.log(chalk.blue('1.') + chalk.white(' 새로운 게임 시작'));
    console.log(chalk.blue('2.') + chalk.white(' 기록 보기'));
    console.log(chalk.blue('3.') + chalk.white(' 업적 보기'));
    console.log(chalk.blue('4.') + chalk.white(' 종료'));

    // 하단 경계선
    console.log(line);

    // 하단 설명
    console.log(chalk.gray('1-4 사이의 수를 입력한 뒤 엔터를 누르세요.'));
}

// 유저 입력을 받아 처리하는 함수
function handleUserInput() {
    const choice = readlineSync.question('insert: ');

    switch (choice) {
        case '1':
            console.log(chalk.green('게임을 시작합니다.'));
            startGame();
            break;
        case '2':
            displayArchive();
            break;
        case '3':
            displayAchievement();
            break;
        case '4':
            console.log(chalk.red('게임을 종료합니다.'));
            process.exit(0); // 게임 종료
            break;
        default:
            console.log(chalk.red('올바른 선택을 하세요.'));
            handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
    }
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 플레이어 이름을 입력받는 함수
async function makePlayer() {
    playerName = readlineSync.question('Please Insert Your name!: ');
    console.log(
        chalk.green(
            figlet.textSync(`Good to see you, ${playerName}!`, {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );

    // 3초 지연
    await delay(1500);//Promise 생성 후 resolve를 반환
}

// 게임 시작 함수
export async function start() { //await을 위해 async함수로 선언
    await delay(2500); //3초 딜레이
    console.clear();
    await makePlayer(); // Promise가 반환될때까지 대기
    displayLobby();
    handleUserInput();
}

// 게임 실행
start();//npm start , npm run start 로 실행하면 한글이 안깨진다.
