# 1. Node.js 18 버전 기반 이미지를 사용합니다.
FROM node:18-alpine

# 2. 작업 디렉터리를 /usr/src/app으로 설정합니다.
WORKDIR /usr/src/app

# 3. 모든 소스 코드와 설정을 한 번에 복사합니다.
# 이전의 'COPY package*.json'과 'COPY . .' 명령을 통합하여 
# package.json의 'type: "module"' 변경 사항이 누락되지 않도록 합니다.
COPY . .

# 4. 의존성 모듈을 설치합니다.
RUN npm install

# 5. 3000번 포트를 외부에 노출합니다. (Docker 내부용)
EXPOSE 3000

# 6. 컨테이너가 시작될 때 Express 서버를 실행합니다.
CMD ["npm", "start"]