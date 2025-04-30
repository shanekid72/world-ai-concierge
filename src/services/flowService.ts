import flowData from '../data/flow.json';

export interface Question {
  text: string;
  voiceAfter?: string;
  voiceIfCFO?: string[];
  expectedAnswers?: string[];
}

export interface Animation {
  duration: string;
  visuals: string[];
  connectionFeed: string[];
  voiceMidAnimation: string;
}

export interface PostAnimation {
  voice: string;
  chat: string;
  voiceDownload: string;
}

export interface CursorSetup {
  steps: string[];
  voice: string;
}

export interface FlowStage {
  id: string;
  voice?: string;
  chat?: string;
  options?: string[];
  onOptionSelect?: Record<string, string>;
  subFlow?: string;
  questions?: Question[];
  next?: string;
  kycChecklist?: string[];
  voiceAfterList?: string;
  animation?: Animation;
  postAnimation?: PostAnimation;
  cursorSetup?: CursorSetup;
  integrationPrompts?: string[];
  voiceAfterPrompts?: string;
}

export interface FlowData {
  stages: FlowStage[];
}

export class FlowService {
  private static instance: FlowService;
  private flowData: FlowData;

  private constructor() {
    this.flowData = flowData as FlowData;
  }

  public static getInstance(): FlowService {
    if (!FlowService.instance) {
      FlowService.instance = new FlowService();
    }
    return FlowService.instance;
  }

  public getStages(): FlowStage[] {
    return this.flowData.stages;
  }

  public getStageById(id: string): FlowStage | undefined {
    return this.flowData.stages.find(stage => stage.id === id);
  }

  public getNextStage(currentStageId: string): FlowStage | undefined {
    const currentStage = this.getStageById(currentStageId);
    if (!currentStage?.next) return undefined;
    return this.getStageById(currentStage.next);
  }

  public getStageByOption(currentStageId: string, option: string): FlowStage | undefined {
    const currentStage = this.getStageById(currentStageId);
    if (!currentStage?.onOptionSelect?.[option]) return undefined;
    return this.getStageById(currentStage.onOptionSelect[option]);
  }

  public getQuestions(stageId: string): Question[] | undefined {
    const stage = this.getStageById(stageId);
    return stage?.questions;
  }

  public getKycChecklist(stageId: string): string[] | undefined {
    const stage = this.getStageById(stageId);
    return stage?.kycChecklist;
  }

  public getAnimation(stageId: string): Animation | undefined {
    const stage = this.getStageById(stageId);
    return stage?.animation;
  }

  public getPostAnimation(stageId: string): PostAnimation | undefined {
    const stage = this.getStageById(stageId);
    return stage?.postAnimation;
  }

  public getCursorSetup(stageId: string): CursorSetup | undefined {
    const stage = this.getStageById(stageId);
    return stage?.cursorSetup;
  }

  public getIntegrationPrompts(stageId: string): string[] | undefined {
    const stage = this.getStageById(stageId);
    return stage?.integrationPrompts;
  }
} 