'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { YoutubeAccount } from '@/lib/types';
import { fetcher } from '@/lib/http';

interface AccountFormProps {
  onCreated: () => void;
  accounts: YoutubeAccount[];
}

interface FormValues {
  label: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
  scopes?: string;
}

const defaultRedirectUri = 'https://developers.google.com/oauthplayground';

function deleteAccountRequest(url: string) {
  return fetch(url, { method: 'DELETE' }).then((res) => {
    if (!res.ok) {
      throw new Error('Failed to delete account');
    }
  });
}

export default function AccountForm({ onCreated, accounts }: AccountFormProps) {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      label: '',
      clientId: '',
      clientSecret: '',
      redirectUri: defaultRedirectUri,
      refreshToken: '',
      scopes: 'https://www.googleapis.com/auth/youtube.upload'
    }
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const scopes = values.scopes
        ? values.scopes
            .split(',')
            .map((scope) => scope.trim())
            .filter(Boolean)
        : [];
      await fetcher('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: values.label,
          clientId: values.clientId,
          clientSecret: values.clientSecret,
          redirectUri: values.redirectUri,
          refreshToken: values.refreshToken,
          scopes
        })
      });
      reset();
      onCreated();
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = async (id: number) => {
    await deleteAccountRequest(`/api/accounts?id=${id}`);
    onCreated();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="col-span-1 lg:col-span-2">
          <label className="text-sm font-medium text-slate-300">Label</label>
          <input
            {...register('label')}
            placeholder="Main Channel"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Client ID</label>
          <input
            {...register('clientId')}
            placeholder="OAuth client id"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Client Secret</label>
          <input
            {...register('clientSecret')}
            placeholder="OAuth client secret"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            type="password"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Redirect URI</label>
          <input
            {...register('redirectUri')}
            placeholder={defaultRedirectUri}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Refresh Token</label>
          <input
            {...register('refreshToken')}
            placeholder="Paste refresh token"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            type="password"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-slate-300">Scopes</label>
          <input
            {...register('scopes')}
            placeholder="https://www.googleapis.com/auth/youtube.upload, https://www.googleapis.com/auth/youtube.readonly"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <button type="submit" className="btn-primary w-full lg:w-auto" disabled={submitting}>
            {submitting ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
            Save Credentials
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {accounts.length === 0 ? (
          <p className="text-sm text-slate-500">
            No credentials stored. Generate OAuth credentials via Google Cloud console and paste them above.
          </p>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-100">{account.label}</p>
                <p className="text-xs text-slate-500">Client: {account.clientId.slice(0, 14)}…</p>
              </div>
              <button
                onClick={() => handleDelete(account.id)}
                className="btn-secondary border-rose-500/40 text-rose-200 hover:bg-rose-500/10"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
