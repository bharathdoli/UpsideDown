import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { getCollegeKey, prettifyCollegeName } from '@/lib/college';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [allColleges, setAllColleges] = useState<string[]>([]);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load existing colleges from profiles to power the dropdown suggestions
  useEffect(() => {
    const fetchColleges = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('college')
        .not('college', 'is', null);

      if (error) {
        // Non-blocking: just log and continue
        console.error('Error fetching colleges for signup:', error);
        return;
      }

      const byKey = new Map<string, string>();

      data?.forEach((row) => {
        const raw = row.college as string | null;
        if (!raw) return;
        const pretty = prettifyCollegeName(raw);
        if (!pretty) return;
        const key = getCollegeKey(pretty);
        if (!key) return;
        if (!byKey.has(key)) {
          byKey.set(key, pretty);
        }
      });

      const list = Array.from(byKey.values()).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
      );

      setAllColleges(list);
    };

    fetchColleges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
          navigate('/dashboard');
        }
      } else {
        if (!fullName.trim()) {
          toast({
            title: "Name Required",
            description: "Please enter your full name.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!college.trim()) {
          toast({
            title: "College Required",
            description: "Please enter your college name.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!branch.trim()) {
          toast({
            title: "Branch Required",
            description: "Please enter your branch (e.g., CSE, ECE).",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const cleanedCollege = prettifyCollegeName(college);

        const { error } = await signUp(email, password, fullName, cleanedCollege, branch.trim());
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created!",
            description: "Welcome to The Campus Upside Down!",
          });
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-primary/5 pointer-events-none" />
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
      
      {/* Back Link */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs md:text-sm hidden sm:inline">Back to Home</span>
      </Link>

      <Card className="w-full max-w-md glass-dark border-border/50 relative z-10 mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mb-4 animate-pulse-glow">
            <span className="text-primary font-stranger text-2xl">TU</span>
          </div>
          <CardTitle className="font-stranger text-xl md:text-2xl text-foreground">
            {isLogin ? 'Enter The Portal' : 'Join The Upside Down'}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm md:text-base">
            {isLogin 
              ? 'Welcome back, explorer. Your campus awaits.' 
              : 'Create your account and explore the hidden world.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college" className="text-foreground">College</Label>
                  <Popover open={showCollegeDropdown} onOpenChange={setShowCollegeDropdown}>
                    <div className="flex flex-col gap-2">
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground box-glow"
                          disabled={allColleges.length === 0}
                        >
                          Browse existing colleges
                        </Button>
                      </PopoverTrigger>
                      <Input
                        id="college"
                        type="text"
                        placeholder="Or enter your college name manually"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-primary"
                        required
                      />
                    </div>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] glass-dark border-border/50 p-3">
                      <div className="space-y-3">
                        <Input
                          placeholder="Search colleges..."
                          value={collegeSearch}
                          onChange={(e) => setCollegeSearch(e.target.value)}
                          className="bg-background/60 border-border/50 focus:border-primary text-sm"
                        />
                        <div className="max-h-48 overflow-y-auto text-sm">
                          {(collegeSearch || college
                            ? allColleges.filter((c) =>
                                c
                                  .toLowerCase()
                                  .includes((collegeSearch || college).toLowerCase())
                              )
                            : allColleges
                          )
                            .slice(0, 20)
                            .map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setCollege(c);
                                  setCollegeSearch('');
                                  setShowCollegeDropdown(false);
                                }}
                                className="flex w-full items-center px-2 py-1.5 text-left rounded-sm hover:bg-primary/10 text-muted-foreground hover:text-primary"
                              >
                                {c}
                              </button>
                            ))}
                          {allColleges.length === 0 && (
                            <p className="text-xs text-muted-foreground px-1 py-1.5">
                              No colleges found yet. Enter yours in the input.
                            </p>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">First try “Browse existing colleges”</span>. If you don&apos;t find yours,
                    enter the exact college name manually above.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-foreground">Branch</Label>
                  <Input
                    id="branch"
                    type="text"
                    placeholder="e.g., CSE, ECE, ME"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary"
                    required
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground box-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
