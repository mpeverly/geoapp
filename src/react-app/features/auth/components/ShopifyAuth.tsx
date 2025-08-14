import { useState } from 'react';
import { ShoppingBag, LogIn, LogOut, User, CreditCard } from 'lucide-react';

interface ShopifyAuthProps {
  user: any;
  onLogin: (user: any) => void;
  onLogout: () => void;
}

export function ShopifyAuth({ user, onLogin, onLogout }: ShopifyAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleShopifyLogin = async () => {
    if (!email || !password) {
      alert('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/shopify/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.user) {
        onLogin(data.user);
        setShowLogin(false);
        setEmail('');
        setPassword('');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Shopify auth error:', error);
      alert('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleRedeemPoints = async () => {
    if (!user) return;
    
    const points = prompt(`You have ${user.points} points. How many would you like to redeem?`);
    if (!points || isNaN(Number(points))) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/redeem-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: Number(points) })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Success! You've redeemed ${points} points. Use discount code: ${data.discount_code}`);
        // Update user points
        onLogin({ ...user, points: data.remaining_points });
      } else {
        alert(data.error || 'Failed to redeem points');
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      alert('Failed to redeem points');
    }
  };

  if (user?.shopify_customer_id) {
    return (
      <div className="flex items-center space-x-4">
        {user.avatar_url && (
          <img 
            src={user.avatar_url} 
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">{user.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{user.points} pts</span>
          {user.points > 0 && (
            <button
              onClick={handleRedeemPoints}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
            >
              Redeem
            </button>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex flex-col space-y-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleShopifyLogin}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Logging in...' : 'Login'}</span>
          </button>
          <button
            onClick={() => setShowLogin(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <ShoppingBag className="w-4 h-4 text-green-600" />
        <span className="text-sm text-gray-600">alp9.com customer?</span>
      </div>
      <button
        onClick={() => setShowLogin(true)}
        className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span>Login</span>
      </button>
    </div>
  );
}
