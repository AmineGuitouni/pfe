import React from 'react';
import { Skeleton } from '@heroui/react';

const MessageSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Welcome/Initial AI Message Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[250px] md:w-[300px] lg:w-[350px] xl:w-[400px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-light_blue/10">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-4/5 bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-full bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-3/4 bg-light_blue/10" />
            </div>
          </div>
        </div>
      </div>

      {/* User Question Skeleton */}
      <div className="flex items-start gap-3 justify-end">
        <div className="relative group">
          <div className="w-[150px] md:w-[200px] lg:w-[250px] xl:w-[300px] px-3 py-2 rounded-lg shadow bg-light_blue-500/20 rounded-br-none border border-light_blue-500/30">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-full bg-light_blue-500/30" />
              <Skeleton className="h-4 rounded w-2/3 bg-light_blue-500/30" />
            </div>
          </div>
        </div>
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue-500/20" />
      </div>

      {/* AI Response with Tool Call Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[275px] md:w-[325px] lg:w-[375px] xl:w-[425px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-light_blue/10">
            <div className="space-y-3">
              {/* Text before tool call */}
              <div className="space-y-2">
                <Skeleton className="h-4 rounded w-full bg-light_blue/10" />
                <Skeleton className="h-4 rounded w-3/4 bg-light_blue/10" />
              </div>
              
              {/* Tool call skeleton */}
              <div className="mt-2 mb-1 p-3 border border-light_blue/20 rounded-lg bg-dark_blue/50">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-4 h-4 rounded bg-light_blue-500/30" />
                  <Skeleton className="h-4 rounded w-1/2 bg-light_blue-500/30" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 rounded w-1/4 bg-light_blue/20" />
                  <div className="pl-2 space-y-1">
                    <Skeleton className="h-3 rounded w-4/5 bg-light_blue/20" />
                    <Skeleton className="h-3 rounded w-3/5 bg-light_blue/20" />
                  </div>
                </div>
                {/* Action buttons skeleton */}
                <div className="flex justify-end mt-3 pt-2 border-t border-light_blue/20">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-16 h-6 rounded bg-light_blue-500/20" />
                    <Skeleton className="w-16 h-6 rounded bg-light_blue-500/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Result Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[275px] md:w-[325px] lg:w-[375px] xl:w-[425px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-dashed border-light_blue-500/40">
            <div className="space-y-2">
              <div className="space-y-1">
                <Skeleton className="h-3 rounded w-1/3 bg-light_blue-500/20" />
                <Skeleton className="h-3 rounded w-1/2 bg-light_blue-500/20" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 rounded w-full bg-light_blue-500/20" />
                <Skeleton className="h-3 rounded w-4/5 bg-light_blue-500/20" />
                <Skeleton className="h-3 rounded w-2/3 bg-light_blue-500/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up AI Response Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[240px] md:w-[290px] lg:w-[340px] xl:w-[390px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-light_blue/10">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-full bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-5/6 bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-3/4 bg-light_blue/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Another User Message Skeleton */}
      <div className="flex items-start gap-3 justify-end">
        <div className="relative group">
          <div className="w-[175px] md:w-[225px] lg:w-[275px] xl:w-[325px] px-3 py-2 rounded-lg shadow bg-light_blue-500/20 rounded-br-none border border-light_blue-500/30">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-full bg-light_blue-500/30" />
              <Skeleton className="h-4 rounded w-3/4 bg-light_blue-500/30" />
            </div>
          </div>
        </div>
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue-500/20" />
      </div>

      {/* Detailed AI Response Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[260px] md:w-[310px] lg:w-[360px] xl:w-[410px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-light_blue/10">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-full bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-11/12 bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-5/6 bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-3/4 bg-light_blue/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Short User Question Skeleton */}
      <div className="flex items-start gap-3 justify-end">
        <div className="relative group">
          <div className="w-[125px] md:w-[175px] lg:w-[225px] xl:w-[275px] px-3 py-2 rounded-lg shadow bg-light_blue-500/20 rounded-br-none border border-light_blue-500/30">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-3/4 bg-light_blue-500/30" />
            </div>
          </div>
        </div>
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue-500/20" />
      </div>

      {/* Final Comprehensive AI Response Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[270px] md:w-[320px] lg:w-[370px] xl:w-[420px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-light_blue/10">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-full bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-11/12 bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-5/6 bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-4/5 bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-2/3 bg-light_blue/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Long User Message Skeleton */}
      <div className="flex items-start gap-3 justify-end">
        <div className="relative group">
          <div className="w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px] px-3 py-2 rounded-lg shadow bg-light_blue-500/20 rounded-br-none border border-light_blue-500/30">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-full bg-light_blue-500/30" />
              <Skeleton className="h-4 rounded w-5/6 bg-light_blue-500/30" />
              <Skeleton className="h-4 rounded w-3/4 bg-light_blue-500/30" />
            </div>
          </div>
        </div>
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue-500/20" />
      </div>

      {/* Final AI Response with Tool Call Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[280px] md:w-[330px] lg:w-[380px] xl:w-[430px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-light_blue/10">
            <div className="space-y-3">
              {/* Text */}
              <div className="space-y-2">
                <Skeleton className="h-4 rounded w-full bg-light_blue/10" />
                <Skeleton className="h-4 rounded w-4/5 bg-light_blue/10" />
              </div>
              
              {/* Another tool call skeleton */}
              <div className="mt-2 mb-1 p-3 border border-light_blue/20 rounded-lg bg-dark_blue/50">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-4 h-4 rounded bg-light_blue-500/30" />
                  <Skeleton className="h-4 rounded w-2/5 bg-light_blue-500/30" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 rounded w-1/3 bg-light_blue/20" />
                  <div className="pl-2 space-y-1">
                    <Skeleton className="h-3 rounded w-full bg-light_blue/20" />
                    <Skeleton className="h-3 rounded w-3/4 bg-light_blue/20" />
                  </div>
                </div>
                <div className="flex justify-end mt-3 pt-2 border-t border-light_blue/20">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-16 h-6 rounded bg-light_blue-500/20" />
                    <Skeleton className="w-16 h-6 rounded bg-light_blue-500/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional User Question Skeleton */}
      <div className="flex items-start gap-3 justify-end">
        <div className="relative group">
          <div className="w-[140px] md:w-[190px] lg:w-[240px] xl:w-[290px] px-3 py-2 rounded-lg shadow bg-light_blue-500/20 rounded-br-none border border-light_blue-500/30">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-3/4 bg-light_blue-500/30" />
            </div>
          </div>
        </div>
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue-500/20" />
      </div>

      {/* AI Response with Multiple Tool Calls Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[290px] md:w-[340px] lg:w-[390px] xl:w-[440px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-light_blue/10">
            <div className="space-y-3">
              {/* Text content */}
              <div className="space-y-2">
                <Skeleton className="h-4 rounded w-full bg-light_blue/10" />
                <Skeleton className="h-4 rounded w-5/6 bg-light_blue/10" />
              </div>
              
              {/* First tool call skeleton */}
              <div className="mt-2 mb-1 p-3 border border-light_blue/20 rounded-lg bg-dark_blue/50">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-4 h-4 rounded bg-light_blue-500/30" />
                  <Skeleton className="h-4 rounded w-2/5 bg-light_blue-500/30" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 rounded w-1/3 bg-light_blue/20" />
                  <div className="pl-2 space-y-1">
                    <Skeleton className="h-3 rounded w-4/5 bg-light_blue/20" />
                    <Skeleton className="h-3 rounded w-3/5 bg-light_blue/20" />
                  </div>
                </div>
              </div>

              {/* Second tool call skeleton */}
              <div className="mt-2 mb-1 p-3 border border-light_blue/20 rounded-lg bg-dark_blue/50">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-4 h-4 rounded bg-light_blue-500/30" />
                  <Skeleton className="h-4 rounded w-1/2 bg-light_blue-500/30" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 rounded w-1/4 bg-light_blue/20" />
                  <div className="pl-2 space-y-1">
                    <Skeleton className="h-3 rounded w-2/3 bg-light_blue/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Tool Results Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[285px] md:w-[335px] lg:w-[385px] xl:w-[435px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-dashed border-light_blue-500/40">
            <div className="space-y-3">
              {/* First result */}
              <div className="space-y-2">
                <Skeleton className="h-3 rounded w-2/5 bg-light_blue-500/20" />
                <div className="space-y-1">
                  <Skeleton className="h-3 rounded w-full bg-light_blue-500/20" />
                  <Skeleton className="h-3 rounded w-3/4 bg-light_blue-500/20" />
                </div>
              </div>
              
              {/* Second result */}
              <div className="space-y-2">
                <Skeleton className="h-3 rounded w-1/3 bg-light_blue-500/20" />
                <div className="space-y-1">
                  <Skeleton className="h-3 rounded w-4/5 bg-light_blue-500/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final AI Summary Response Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[245px] md:w-[295px] lg:w-[345px] xl:w-[395px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-light_blue/10">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-full bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-5/6 bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-4/5 bg-light_blue/10" />
              <Skeleton className="h-4 rounded w-2/3 bg-light_blue/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Another User Question Skeleton */}
      <div className="flex items-start gap-3 justify-end">
        <div className="relative group">
          <div className="w-[160px] md:w-[210px] lg:w-[260px] xl:w-[310px] px-3 py-2 rounded-lg shadow bg-light_blue-500/20 rounded-br-none border border-light_blue-500/30">
            <div className="space-y-2">
              <Skeleton className="h-4 rounded w-5/6 bg-light_blue-500/30" />
            </div>
          </div>
        </div>
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue-500/20" />
      </div>

      {/* AI Response with Code/Data Skeleton */}
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue/20" />
        <div className="relative group">
          <div className="w-[300px] md:w-[350px] lg:w-[400px] xl:w-[450px] px-3 py-2 rounded-lg shadow bg-modal_bg rounded-bl-none border border-light_blue/10">
            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 rounded w-4/5 bg-light_blue/10" />
                <Skeleton className="h-4 rounded w-3/5 bg-light_blue/10" />
              </div>
              
              {/* Code block skeleton */}
              <div className="mt-2 mb-1 p-3 border border-light_blue/20 rounded-lg bg-dark_blue/80">
                <div className="space-y-1">
                  <Skeleton className="h-3 rounded w-2/3 bg-light_blue-500/20" />
                  <Skeleton className="h-3 rounded w-full bg-light_blue-500/20" />
                  <Skeleton className="h-3 rounded w-4/5 bg-light_blue-500/20" />
                  <Skeleton className="h-3 rounded w-1/2 bg-light_blue-500/20" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-4 rounded w-full bg-light_blue/10" />
                <Skeleton className="h-4 rounded w-2/3 bg-light_blue/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSkeleton;
