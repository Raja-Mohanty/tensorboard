/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/
import {DataLoadState} from '../../types/data';

import {RouteContextedState} from '../../app_routing/route_contexted_reducer_helper';
import {
  HistogramStepDatum,
  ImageStepDatum,
  NonSampledPluginType,
  PluginType,
  SampledPluginType,
  ScalarStepDatum,
  TagToDescription,
  TagToRunSampledInfo,
} from '../data_source';
import {
  CardId,
  CardMetadata,
  HistogramMode,
  NonPinnedCardId,
  PinnedCardId,
  TooltipSort,
  XAxisType,
} from '../types';

export const METRICS_FEATURE_KEY = 'metrics';

type RunId = string;

type tagToRunIds = Record<string, RunId[]>;

export interface NonSampledPluginTagMetadata {
  tagDescriptions: TagToDescription;
  tagToRuns: tagToRunIds;
}

export interface SampledPluginTagMetadata {
  tagDescriptions: TagToDescription;
  tagRunSampledInfo: TagToRunSampledInfo;
}

export type TagMetadata = {
  [NSPT in NonSampledPluginType]: NonSampledPluginTagMetadata;
} &
  {
    [SPT in SampledPluginType]: SampledPluginTagMetadata;
  };

export interface StepDatum {
  [PluginType.SCALARS]: ScalarStepDatum;
  [PluginType.HISTOGRAMS]: HistogramStepDatum;
  [PluginType.IMAGES]: ImageStepDatum;
}

export interface RunToSeries<T extends PluginType = PluginType> {
  [runId: string]: StepDatum[T][];
}

export interface RunToLoadState {
  [runId: string]: DataLoadState;
}

interface BaseTimeSeriesLoadable<T extends PluginType> {
  runToSeries: RunToSeries<T>;
  runToLoadState: RunToLoadState;
}

export type ScalarTimeSeriesLoadable = BaseTimeSeriesLoadable<
  PluginType.SCALARS
>;
export type HistogramTimeSeriesLoadable = BaseTimeSeriesLoadable<
  PluginType.HISTOGRAMS
>;
export type ImageTimeSeriesLoadable = BaseTimeSeriesLoadable<PluginType.IMAGES>;

export type TimeSeriesLoadables = {
  [PluginType.SCALARS]: ScalarTimeSeriesLoadable;
  [PluginType.HISTOGRAMS]: HistogramTimeSeriesLoadable;
  [PluginType.IMAGES]: ImageTimeSeriesLoadable;
};

export type TimeSeriesLoadable = TimeSeriesLoadables[PluginType];

export interface ScalarTimeSeriesData {
  [tag: string]: ScalarTimeSeriesLoadable;
}

export interface HistogramTimeSeriesData {
  [tag: string]: HistogramTimeSeriesLoadable;
}

export interface ImageTimeSeriesData {
  [tag: string]: {[sample: number]: ImageTimeSeriesLoadable};
}

export type TimeSeriesData = {
  [PluginType.SCALARS]: ScalarTimeSeriesData;
  [PluginType.HISTOGRAMS]: HistogramTimeSeriesData;
  [PluginType.IMAGES]: ImageTimeSeriesData;
};

export type CardMetadataMap = Record<
  NonPinnedCardId | PinnedCardId,
  CardMetadata
>;

/**
 * Map from cards to their step index into the time series. Step index may be
 * null when the time series becomes empty.
 */
export type CardStepIndexMap = Record<
  NonPinnedCardId | PinnedCardId,
  number | null
>;

export interface MetricsRoutefulState {
  tagMetadataLoaded: DataLoadState;
  tagMetadata: TagMetadata;
  // A list of card ids in the main content area, excluding pinned copies.
  cardList: NonPinnedCardId[];
  cardToPinnedCopy: Map<NonPinnedCardId, PinnedCardId>;
  pinnedCardToOriginal: Map<PinnedCardId, NonPinnedCardId>;
  cardMetadataMap: CardMetadataMap;
  cardStepIndex: CardStepIndexMap;
  tagFilter: string;
  tagGroupExpanded: Map<string, boolean>;
}

export interface MetricsRoutelessState {
  timeSeriesData: TimeSeriesData;
  settings: {
    tooltipSort: TooltipSort;
    ignoreOutliers: boolean;
    xAxisType: XAxisType;
    scalarSmoothing: number;
    /**
     * A non-negative, unitless number. A value of 5000 corresponds to 500%
     * increased brightness from normal.
     */
    imageBrightnessInMilli: number;
    /**
     * A non-negative, unitless number. A value of 5000 corresponds to 500%
     * increased contrast from normal.
     */
    imageContrastInMilli: number;
    imageShowActualSize: boolean;
    histogramMode: HistogramMode;
  };
  visibleCards: Set<CardId>;
}

export type MetricsState = RouteContextedState<
  MetricsRoutefulState,
  MetricsRoutelessState
>;

export interface State {
  [METRICS_FEATURE_KEY]?: MetricsState;
}
