# Tesla Discord AI Bot

בוט AI לדיסקורד בשם Tesla.

## התקנה

1. התקן Node.js במחשב.
2. פתח CMD/Terminal בתיקייה הזאת.
3. תריץ:

```bash
npm install
```

4. שנה את השם של הקובץ:

```txt
.env.example
```

לשם:

```txt
.env
```

5. בתוך `.env` תכניס:

```env
DISCORD_TOKEN=הטוקן של הבוט מדיסקורד
CLIENT_ID=האיידי של האפליקציה מדיסקורד
OPENAI_API_KEY=המפתח שלך מ־OpenAI
```

## העלאת הפקודה לדיסקורד

```bash
npm run deploy
```

## הפעלת הבוט

```bash
npm start
```

## שימוש בשרת

```txt
/ask השאלה שלך
```

## חשוב

אל תשלח לאף אחד את הקובץ `.env`.
מי שיש לו את הטוקנים יכול לשלוט בבוט או להשתמש בחשבון שלך.
