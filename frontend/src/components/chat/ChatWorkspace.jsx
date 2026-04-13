import { ImagePlus, Phone, SendHorizonal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { serviceRequestsApi } from '../../api/modules.js';

export function ChatWorkspace({
  conversations,
  selectedConversation,
  onSelectConversation,
  onSendMessage,
  sendLoading,
  currentUser,
  typingState,
  onTyping,
}) {
  const [draft, setDraft] = useState('');
  const [image, setImage] = useState(null);

  const activeParticipant = useMemo(
    () =>
      selectedConversation?.participants?.find(
        (participant) => participant.id !== currentUser?.id
      ),
    [currentUser?.id, selectedConversation]
  );

  const serviceRequest = selectedConversation?.service_request;
  const order = selectedConversation?.order;

  const isProvider = serviceRequest?.provider?.id === currentUser?.id;
  const canSendPaymentRequest =
    isProvider && serviceRequest?.status === 'accepted' && !order;
  const canPayNow =
    !isProvider &&
    serviceRequest?.status === 'accepted' &&
    order &&
    order.payment_status !== 'paid';

  const canPayServiceRequest =
    !isProvider && serviceRequest?.status === 'accepted' && !order;

  const [paymentLoading, setPaymentLoading] = useState(false);

  const onSendPaymentRequest = async () => {
    if (!serviceRequest) return;
    setPaymentLoading(true);
    try {
      const response = await serviceRequestsApi.sendPaymentRequest(
        serviceRequest.id
      );

      if (response?.order && selectedConversation) {
        onSelectConversation({
          ...selectedConversation,
          order: response.order,
          service_request: {
            ...selectedConversation.service_request,
            order: response.order,
          },
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!draft && !image) {
      return;
    }

    await onSendMessage({ body: draft, image });
    setDraft('');
    setImage(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
      <div className="soft-panel overflow-hidden">
        <div className="border-b border-blue-100 p-4">
          <h3 className="text-lg font-bold">Conversations</h3>
          <p className="text-sm text-slate-500">
            Recent chats with clients, providers, and vendors.
          </p>
        </div>
        <div className="max-h-[760px] overflow-y-auto">
          {conversations.map((conversation) => {
            const partner = conversation.participants?.find(
              (participant) => participant.id !== currentUser?.id
            );
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation)}
                className={clsx(
                  'flex w-full items-start gap-3 border-b border-blue-50 px-4 py-4 text-left transition',
                  selectedConversation?.id === conversation.id
                    ? 'bg-blue-50'
                    : 'hover:bg-slate-50'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-800">
                  {(partner?.display_name ?? partner?.name ?? '?')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-semibold text-slate-900">
                      {partner?.display_name ?? partner?.name ?? 'Conversation'}
                    </p>
                    <span className="text-xs text-slate-400">
                      {dayjs(conversation.updated_at).format('HH:mm')}
                    </span>
                  </div>
                  <p className="truncate text-sm text-slate-500">
                    {conversation.last_message?.body ??
                      'Open chat to start messaging'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="soft-panel flex min-h-[720px] flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between border-b border-blue-100 px-6 py-4">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {activeParticipant?.display_name ?? activeParticipant?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {typingState
                    ? 'Typing…'
                    : activeParticipant?.is_online
                    ? 'Online now'
                    : 'Available via secure chat'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeParticipant?.phone && (
                  <a
                    href={`tel:${activeParticipant.phone}`}
                    className="button-secondary"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </a>
                )}

                {canSendPaymentRequest && (
                  <button
                    type="button"
                    onClick={onSendPaymentRequest}
                    className="button-primary"
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Sending...' : 'Send Payment Request'}
                  </button>
                )}

                {canPayNow && order && (
                  <Link
                    to={`/payments/order/${order.id}`}
                    className="button-primary"
                  >
                    Pay Now
                  </Link>
                )}

                {canPayServiceRequest && (
                  <Link
                    to={`/payments/service-request/${serviceRequest.id}`}
                    className="button-primary"
                  >
                    Proceed to Payment
                  </Link>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-6 py-6">
              {selectedConversation.messages?.map((message) => {
                const mine = message.user?.id === currentUser?.id;
                return (
                  <div
                    key={message.id}
                    className={clsx(
                      'flex',
                      mine ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={clsx(
                        'max-w-[75%] rounded-[24px] px-4 py-3 shadow-sm',
                        mine
                          ? 'bg-blue-700 text-white'
                          : 'bg-white text-slate-800'
                      )}
                    >
                      {message.image_url && (
                        <img
                          src={message.image_url}
                          alt=""
                          className="mb-3 h-48 w-full rounded-2xl object-cover"
                        />
                      )}
                      {message.body && (
                        <p className="text-sm leading-6">{message.body}</p>
                      )}
                      <p
                        className={clsx(
                          'mt-2 text-xs',
                          mine ? 'text-blue-100' : 'text-slate-400'
                        )}
                      >
                        {dayjs(message.created_at).format('HH:mm')}
                        {mine && message.seen_at ? ' · Seen' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={submit}
              className="border-t border-blue-100 bg-white px-6 py-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <label className="button-secondary cursor-pointer">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      setImage(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
                <input
                  className="field flex-1"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    onTyping();
                  }}
                />
                <button
                  type="submit"
                  className="button-primary"
                  disabled={sendLoading}
                >
                  <SendHorizonal className="mr-2 h-4 w-4" />
                  {sendLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
              {image && (
                <p className="mt-3 text-sm text-slate-500">
                  Attached image: {image.name}
                </p>
              )}
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-500">
            Choose a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
