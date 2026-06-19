import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Mail, Shield, Loader2 } from "lucide-react";
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
  const [code, setCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setNewEmail("");
      setCode("");
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

  const handleSendCode = async () => {
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
      toast.success("Verification code sent to " + newEmail);
      startTimer();
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
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
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    try {
      await onVerify(newEmail.trim(), code);
      toast.success("Email updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
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
                  disabled={isSendingCode || isVerifying}
                  className="pl-9 pr-3 h-10 bg-background border-input text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={!isValidEmail(newEmail) || timer > 0 || isSendingCode || isVerifying}
                className="h-10 shrink-0 font-semibold cursor-pointer"
              >
                {isSendingCode && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                {timer > 0 ? `Resend (${timer}s)` : codeSent ? "Resend" : "Send Code"}
              </Button>
            </div>
          </div>

          {codeSent && (
            <div className="space-y-2 border-t border-border pt-4 animate-in fade-in-50 duration-200">
              <Label className="text-sm font-semibold text-foreground">
                6-Digit Verification Code
              </Label>
              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Enter the code sent to <strong className="text-foreground">{newEmail}</strong>.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
            className="flex-1 cursor-pointer text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleVerify}
            disabled={code.length !== 6 || isVerifying || isSendingCode}
            className="flex-1 font-semibold cursor-pointer"
          >
            {isVerifying && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            Verify & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
