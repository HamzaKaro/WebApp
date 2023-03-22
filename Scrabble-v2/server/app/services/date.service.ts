import { Period } from '@app/interfaces/period';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import date = require('date-and-time');
const SECONDS_IN_MINUTE = 60;
const THOUSAND = 1000;
export class DateService {
    // The format of this timestamp is easly parsable
    // format : dd/mm/yy hh:mm:ss
    static getParsableTimestamp(): string {
        const now = new Date();
        return date.format(now, 'YYYY/MM/DD HH:mm:ss');
        // return new Date().toLocaleString('us-US', {
        //     timeZone: 'America/New_York',
        //     hour: '2-digit',
        //     minute: '2-digit',
        //     second: '2-digit',
        //     day: '2-digit',
        //     month: '2-digit',
        //     year: '2-digit',
        // });
    }
    static getMontrealTimestamp(): string {
        let timestamp = new Date().toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        // Le string est selon le format hh:mm:ss AM (ou PM)
        if (timestamp.length > 2 && timestamp[timestamp.length - 2] === 'P') {
            // Obtenir hh du string hh:mm:ss PM
            const hh: string = timestamp.slice(0, 2);

            // 12:00:00 PM doit devenir 00:00:00
            // 01:00:00 PM doit devenir 13:00:00
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const hhAdjusted = hh === '12' ? '00' : (parseInt(hh, 10) + 12).toString();

            // hhAdjusted + :mm:ss
            timestamp = hhAdjusted + timestamp.slice(2, timestamp.length - 2);
            return timestamp;
        }

        // minuit est 12:00:00 AM
        else if (timestamp.length > 2 && timestamp[timestamp.length - 2] === 'A' && timestamp.slice(0, 2) === '12') {
            return '00' + timestamp.slice(2, timestamp.length - 2);
        }

        // Remove the AM (or PM)
        return timestamp.slice(0, timestamp.length - 2);
    }
    // the parameters must be coming from the method 'getParsableTimestamp()'
    // returns the differences in milliseconds (ms)
    static getParsableTimestampsDifference(timestamp1: string, timestamp2: string): number {
        // return Math.abs(Date.parse(timestamp2) - Date.parse(timestamp1));

        return date.subtract(new Date(timestamp2), new Date(timestamp1)).toMilliseconds();
    }
    getCurrentDate(): string {
        return new Date().toISOString();
    }
    getGamePeriod(startDate: Date, endDate: Date): Period {
        const diff = Math.floor((endDate.getTime() - startDate.getTime()) / THOUSAND);
        const minutes = Math.floor(diff / SECONDS_IN_MINUTE);
        const seconds = diff % SECONDS_IN_MINUTE;
        const period: Period = { minute: minutes, second: seconds };
        return period;
    }
    convertToString(period: Period): string {
        return '' + period.minute + 'mn' + ' ' + period.second + 's';
    }

    getTimestamp() {
        const today = new Date();
        const hh = today.getHours().toString().padStart(2, '0');
        const mm = today.getMinutes().toString().padStart(2, '0'); // January is 0
        const ss = today.getSeconds().toString().padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }

    getMontrealDatetime(): string {
        const datetime = new Date().toLocaleString('fr-FR', {
            timeZone: 'America/New_York',
            hour12: false,
        });
        return datetime;
    }
}
