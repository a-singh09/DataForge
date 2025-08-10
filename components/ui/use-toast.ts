// Simple toast implementation for demo purposes
// In a real app, you'd use a proper toast library like sonner or react-hot-toast

export function toast({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  // For now, just log to console
  // In production, this would show an actual toast notification
  console.log(`Toast: ${title} - ${description}`);

  // You could also create a simple notification div here
  const notification = document.createElement("div");
  notification.className =
    "fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50";
  notification.innerHTML = `
    <div class="font-medium">${title}</div>
    <div class="text-sm text-gray-300">${description}</div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
