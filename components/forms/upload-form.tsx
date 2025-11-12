'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { AIProfile, YoutubeAccount } from '@/lib/types';
import { fetcher } from '@/lib/http';

interface UploadFormProps {
  accounts: YoutubeAccount[];
  profiles: AIProfile[];
  onCreated: () => void;
}

interface FormValues {
  accountId: number | '';
  profileId: number | '';
  title: string;
  description: string;
  tags: string;
  categoryId: string;
  visibility: 'public' | 'unlisted' | 'private';
  language: string;
  madeForKids: boolean;
  scheduleType: 'immediate' | 'scheduled' | 'draft';
  scheduledFor: string;
  sourceType: 'file' | 'remote';
  sourceValue: string;
  thumbnailUrl: string;
  transcript: string;
}

export default function UploadForm({ accounts, profiles, onCreated }: UploadFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      accountId: '',
      profileId: '',
      title: '',
      description: '',
      tags: '',
      categoryId: '22',
      visibility: 'private',
      language: 'en',
      madeForKids: false,
      scheduleType: 'immediate',
      scheduledFor: '',
      sourceType: 'remote',
      sourceValue: '',
      thumbnailUrl: '',
      transcript: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const scheduleType = watch('scheduleType');

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        accountId: values.accountId === '' ? null : Number(values.accountId),
        title: values.title,
        description: values.description,
        tags: values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        categoryId: values.categoryId || null,
        visibility: values.visibility,
        language: values.language || null,
        madeForKids: values.madeForKids,
        scheduleType: values.scheduleType,
        scheduledFor: values.scheduleType === 'scheduled' ? values.scheduledFor || null : null,
        sourceType: values.sourceType,
        sourceValue: values.sourceValue,
        thumbnailUrl: values.thumbnailUrl || null,
        transcript: values.transcript || null,
        aiSummary: null,
        automationPlan: null,
        status: values.scheduleType === 'draft' ? 'draft' : 'queued'
      };

      await fetcher('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      onCreated();
    } finally {
      setSubmitting(false);
    }
  });

  const runAIMetadata = async () => {
    const title = watch('title');
    const transcript = watch('transcript');
    if (!title) return;

    setAiLoading(true);
    try {
      const response = await fetcher('/api/ai/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: title,
          transcript,
          targetKeywords: watch('tags')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          tone: profiles.find((profile) => profile.id === Number(watch('profileId')))?.tone ?? 'Balanced and engaging'
        })
      });

      if (response?.plan) {
        setValue('title', response.plan.title ?? title);
        setValue('description', response.plan.description ?? transcript ?? '');
        setValue('tags', Array.isArray(response.plan.tags) ? response.plan.tags.join(', ') : watch('tags'));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-300">Account</label>
          <select
            {...register('accountId')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">AI Profile</label>
          <select
            {...register('profileId')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">None</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Visibility</label>
          <select
            {...register('visibility')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Title</label>
        <input
          {...register('title', { required: true })}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Automate YouTube uploads with AI"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Description</label>
        <textarea
          {...register('description', { required: true })}
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Outline the value prop, CTA, and timestamps."
          required
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-300">Tags</label>
          <input
            {...register('tags')}
            placeholder="automation, ai, youtube, creator"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Category</label>
          <select
            {...register('categoryId')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="1">Film & Animation</option>
            <option value="2">Autos & Vehicles</option>
            <option value="10">Music</option>
            <option value="22">People & Blogs</option>
            <option value="27">Education</option>
            <option value="28">Science & Technology</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Language</label>
          <input
            {...register('language')}
            placeholder="en"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-300">Schedule</label>
          <select
            {...register('scheduleType')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="immediate">Immediate</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Manual</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Scheduled At</label>
          <input
            {...register('scheduledFor')}
            type="datetime-local"
            disabled={scheduleType !== 'scheduled'}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            {...register('madeForKids')}
            type="checkbox"
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-300">Made for kids</span>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-300">Video Source</label>
          <select
            {...register('sourceType')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="remote">Remote URL</option>
            <option value="file">Server Path</option>
          </select>
          <input
            {...register('sourceValue', { required: true })}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://cdn.yoursource.com/video.mp4"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Thumbnail URL</label>
          <input
            {...register('thumbnailUrl')}
            placeholder="https://cdn.yoursource.com/thumbnail.jpg"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Transcript / Notes</label>
        <textarea
          {...register('transcript')}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Paste transcript or bullet point outline for AI planning."
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-secondary" onClick={runAIMetadata} disabled={aiLoading}>
          {aiLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <SparklesIcon className="h-4 w-4" />}
          AI Metadata
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
          Queue Upload
        </button>
      </div>
    </form>
  );
}
