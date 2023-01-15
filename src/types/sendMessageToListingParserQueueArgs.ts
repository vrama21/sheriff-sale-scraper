import { NJCounty } from './njCounty';

export type SendMessageToListingParserQueueArgs = {
  aspSessionId: string;
  county: NJCounty;
  propertyIds: string[];
};
