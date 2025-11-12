'use client';

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { PlusIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import AccountForm from '@/components/forms/account-form';
import UploadForm from '@/components/forms/upload-form';
import ProfileForm from '@/components/forms/profile-form';
import type { AIProfile, UploadTask, YoutubeAccount } from '@/lib/types';
import { fetcher } from '@/lib/http';

interface DashboardProps {
  initialUploads: UploadTask[];
  initialAccounts: YoutubeAccount[];
  initialProfiles: AIProfile[];
}

export default function Dashboard({ initialAccounts, initialProfiles, initialUploads }: DashboardProps) {
  const { data: uploadsData, isValidating: uploadsValidating } = useSWR<{ uploads: UploadTask[] }>(
    '/api/uploads',
    fetcher,
    {
      fallbackData: { uploads: initialUploads }
    }
  );
  const { data: accountsData } = useSWR<{ accounts: YoutubeAccount[] }>('/api/accounts', fetcher, {
    fallbackData: { accounts: initialAccounts }
  });
  const { data: profilesData } = useSWR<{ profiles: AIProfile[] }>('/api/profiles', fetcher, {
    fallbackData: { profiles: initialProfiles }
  });

  const uploads = uploadsData?.uploads ?? [];
  const accounts = accountsData?.accounts ?? [];
  const profiles = profilesData?.profiles ?? [];
  const [selectedUploadId, setSelectedUploadId] = useState<number | null>(uploads[0]?.id ?? null);

  const selectedUpload = uploads.find((upload) => upload.id === selectedUploadId) ?? uploads[0] ?? null;

  const refreshUploads = () => mutate('/api/uploads');

  const triggerUpload = async (uploadId: number) => {
    await fetch(`/api/uploads/${uploadId}/run`, {
      method: 'POST'
    });
    refreshUploads();
  };

  const triggerCron = async () => {
    await fetch('/api/cron', {
      method: 'POST'
    });
    refreshUploads();
  };

  return (
    <>
      <section className="card flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Automation Console</h2>
            <p className="mt-1 text-sm text-slate-400">
              Link accounts, orchestrate AI-assisted metadata, and manage your upload queue.
            </p>
          </div>
          <button className="btn-primary" onClick={triggerCron}>
            <ArrowPathIcon className="h-4 w-4" />
            Run Autopilot
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card-section">
            <span className="subheading">YouTube Credentials</span>
            <AccountForm onCreated={() => mutate('/api/accounts')} accounts={accounts} />
          </div>
          <div className="card-section">
            <span className="subheading">AI Profiles</span>
            <ProfileForm profiles={profiles} onSaved={() => mutate('/api/profiles')} />
          </div>
        </div>

        <div className="card-section">
          <div className="flex items-center justify-between gap-3">
            <span className="heading">New Upload Plan</span>
            <span className="pill border-blue-400/40 bg-blue-400/10 text-blue-200">
              <PlusIcon className="h-4 w-4" />
              AI assisted
            </span>
          </div>
          <UploadForm accounts={accounts} profiles={profiles} onCreated={refreshUploads} />
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="subheading">Queue</span>
            <h2 className="text-xl font-semibold text-white">Upcoming Uploads</h2>
          </div>
          {uploadsValidating ? (
            <span className="pill border-blue-400/40 bg-blue-400/10 text-blue-200">Refreshing</span>
          ) : (
            <button className="btn-secondary" onClick={refreshUploads}>
              <ArrowPathIcon className="h-4 w-4" />
              Refresh
            </button>
          )}
        </div>

        <div className="grid gap-3">
          {uploads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
              No uploads scheduled. Create a plan to kick things off.
            </div>
          ) : (
            uploads.map((upload) => (
              <button
                key={upload.id}
                onClick={() => setSelectedUploadId(upload.id)}
                className={`flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left transition ${
                  selectedUpload?.id === upload.id
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-slate-800/80 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <StatusBadge status={upload.status} />
                    <span>{upload.visibility.toUpperCase()}</span>
                    {upload.scheduleType === 'scheduled' && upload.scheduledFor ? (
                      <span>{format(parseISO(upload.scheduledFor), 'PPpp')}</span>
                    ) : (
                      <span>{upload.scheduleType}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-50">{upload.title}</h3>
                  <p className="line-clamp-2 text-sm text-slate-400">{upload.description}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    triggerUpload(upload.id);
                  }}
                >
                  <PlayCircleIcon className="h-4 w-4" />
                  Launch
                </button>
              </button>
            ))
          )}
        </div>

        {selectedUpload ? (
          <div className="card-section">
            <div className="flex items-center gap-2">
              <span className="heading">Automation Plan</span>
              {selectedUpload.accountId ? (
                <span className="pill border-emerald-500/40 bg-emerald-500/10 text-emerald-300">Account linked</span>
              ) : (
                <span className="pill border-amber-500/40 bg-amber-500/10 text-amber-300">Account missing</span>
              )}
            </div>
            <div className="grid gap-3 text-sm text-slate-300">
              <p>
                <span className="font-semibold text-slate-200">Source:</span> {selectedUpload.sourceType} ·{' '}
                <code className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200">{selectedUpload.sourceValue}</code>
              </p>
              {selectedUpload.automationPlan ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300">
                  {selectedUpload.automationPlan}
                </div>
              ) : (
                <p className="text-slate-500">No AI plan generated yet.</p>
              )}
              {selectedUpload.failureReason && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span>{selectedUpload.failureReason}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

function StatusBadge({ status }: { status: UploadTask['status'] }) {
  if (status === 'published') {
    return (
      <span className="pill border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
        <CheckCircleIcon className="h-4 w-4" />
        Published
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="pill border-rose-500/40 bg-rose-500/10 text-rose-300">
        <ExclamationTriangleIcon className="h-4 w-4" />
        Failed
      </span>
    );
  }

  if (status === 'uploading') {
    return (
      <span className="pill border-blue-400/40 bg-blue-400/10 text-blue-200">
        <ArrowPathIcon className="h-4 w-4 animate-spin" />
        Uploading
      </span>
    );
  }

  return (
    <span className="pill border-slate-600 bg-slate-800 text-slate-300 capitalize">
      {status}
    </span>
  );
}
