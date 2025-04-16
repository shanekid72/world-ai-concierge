
export const appendMessageToChat = (responseText: string) => {
  const messageContainer = document.querySelector('.chat-container');
  if (messageContainer) {
    const div = document.createElement('div');
    div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
      <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
        <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
      </div>
      <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
        <div class="whitespace-pre-wrap">${responseText}</div>
        <div class="text-xs mt-1 text-right text-gray-500">
          ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>`;
    messageContainer.appendChild(div);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
};
