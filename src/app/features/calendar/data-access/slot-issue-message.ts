import { TranslationParams } from '../../../core/i18n/translation-params';
import { SlotIssue } from '../../../core/scheduling/scheduling.rules';
import { toTimeInputValue } from '../../../shared/utils/date-time.utils';

export interface SlotIssueMessage {
  readonly key: string;
  readonly params: TranslationParams;
}

/** Maps a scheduling rule violation to the same messages the appointment form shows. */
export function describeSlotIssue(issue: SlotIssue, professionalName: string): SlotIssueMessage {
  switch (issue.code) {
    case 'invalidRange':
      return { key: 'validation.endBeforeStart', params: {} };
    case 'past':
      return { key: 'validation.pastSlot', params: {} };
    case 'dayOff':
      return { key: 'validation.dayOff', params: { name: professionalName } };
    case 'outsideHours':
      return {
        key: 'validation.outsideWorkingHours',
        params: { name: professionalName, start: issue.start, end: issue.end },
      };
    case 'overlap': {
      const [first] = issue.conflicts;
      return {
        key: 'validation.overlap',
        params: {
          start: toTimeInputValue(new Date(first.start)),
          end: toTimeInputValue(new Date(first.end)),
        },
      };
    }
  }
}
