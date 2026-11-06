import { describe, expect, it } from 'vitest';
import { answerAI, initialEmployees, insightsFor, reviewDraft } from '@/lib/hr/model';
describe('Mock AI data rules',()=>{
  it('answers from supplied employee data rather than a fixed late arrival count',()=>{
    const employee=initialEmployees[0];if(!employee)throw new Error('Missing fixture');
    expect(answerAI('Who has the most late arrivals?', [{...employee,name:'Test Person',late:7}])).toContain('Test Person (Design) has the most late arrivals this week: 7');
  });
  it('flags employees whose mock goals are below 70 percent',()=>{
    const employee=initialEmployees[0];if(!employee)throw new Error('Missing fixture');
    expect(insightsFor([{...employee,goal:69},{...employee,goal:70}])[1]?.title).toBe('1 employees need goal support');
  });
  it('drafts feedback from the selected goals and rating',()=>{
    const employee=initialEmployees[0];if(!employee)throw new Error('Missing fixture');
    expect(reviewDraft({...employee,goal:62,rating:81},'Supportive')).toContain('62% of Q4 goals with a performance rating of 81/100');
  });
});