import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Mail, Shield, Loader2, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface EmailVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
  onSendCode: (email: string) => Promise<void>;
  onVerify: (newEmail: string, code: string) => Promise<void>;
}

export function EmailVerificationDialog({
  open,
  onOpenChange,
  currentEmail,
  onSendCode,
  onVerify
}: EmailVerificationDialogProps) {
  const [newEmail, setNewEmail] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setNewEmail("");
      setCodeSent(false);
      setTimer(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendLink = async () => {
    if (!isValidEmail(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (newEmail.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
      toast.error("New email must be different from current email");
      return;
    }

    setIsSendingCode(true);
    try {
      await onSendCode(newEmail.trim());
      setCodeSent(true);
      toast.success("Verification link sent to " + newEmail);
      startTimer();
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsSendingCode(false);
    }
  };

  const startTimer = () => {
    setTimer(60);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      // Firebase verifyBeforeUpdateEmail updates the auth state when the user clicks the link.
      // So we just call onVerify which reloads the user and updates Supabase.
      await onVerify(newEmail.trim(), "");
      toast.success("Email updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Verification failed. Please ensure you clicked the link in the email.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-primary" />
            Change Email Address
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            For security, you must verify ownership of your new email address.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="new-email" className="text-sm font-semibold text-foreground">
              New Email Address
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="new-email"
                  type="email"
                  placeholder="e.g. you@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isSendingCode || isVerifying || codeSent}
                  className="pl-9 pr-3 h-10 bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              {!codeSent && (
                <Button
                  type="button"
                  onClick={handleSendLink}
                  disabled={!isValidEmail(newEmail) || isSendingCode || isVerifying}
                  className="h-10 shrink-0 font-semibold cursor-pointer"
                >
                  {isSendingCode && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Send Link
                </Button>
              )}
            </div>
          </div>

          {codeSent && (
            <div className="space-y-3 border-t border-border pt-4 animate-in fade-in-50 duration-200">
              <div className="flex gap-2.5 items-start bg-primary/5 border border-primary/20 p-3.5 rounded-lg text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Verification email sent</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    We sent a verification link to <strong className="text-foreground">{newEmail}</strong>.
                    Please open your email client, click that link, and then return here to complete the change.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 items-center text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Didn't get the email? Check your spam folder or try resending.</span>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleSendLink}
                  disabled={timer > 0 || isSendingCode || isVerifying}
                  className="text-xs text-primary font-medium hover:underline p-0 h-auto cursor-pointer"
                >
                  {timer > 0 ? `Resend link in ${timer}s` : "Resend verification link"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
            className="flex-1 cursor-pointer text-foreground border-border hover:bg-muted"
          >
            Cancel
          </Button>
          {codeSent && (
            <Button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || isSendingCode}
              className="flex-1 font-semibold cursor-pointer"
            >
              {isVerifying && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              I've Clicked the Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

