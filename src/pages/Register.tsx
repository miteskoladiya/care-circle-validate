import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, User, Mail, Lock, Phone, Calendar, UserCheck, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Patient",
    age: "",
    gender: "",
    contactNumber: "",
    termsAccepted: false,
    doctorDocument: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please ensure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.termsAccepted) {
      toast({
        title: "Terms required",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "Doctor" && !formData.doctorDocument) {
      toast({
        title: "Document required",
        description: "Please upload your medical degree or license",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      toast({
        title: "Account created successfully!",
        description: formData.role === "Doctor" 
          ? "Your account is pending verification by our admin team."
          : "Welcome to CareCircle! You can now sign in.",
      });
      
      navigate("/login");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">CareCircle</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Join our community</h1>
          <p className="text-muted-foreground">Create your healthcare community account</p>
        </div>

        <Card className="shadow-healthcare">
          <CardHeader>
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="pl-10"
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Account Type
                </Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                    <RadioGroupItem value="Patient" id="patient-reg" />
                    <Label htmlFor="patient-reg" className="font-normal cursor-pointer flex-1">
                      Patient
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                    <RadioGroupItem value="Doctor" id="doctor-reg" />
                    <Label htmlFor="doctor-reg" className="font-normal cursor-pointer flex-1">
                      Doctor
                    </Label>
                  </div>
                </RadioGroup>
                {formData.role === "Doctor" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground bg-accent-light p-3 rounded-lg">
                      <strong>Note:</strong> Doctor accounts require verification by our admin team. 
                      You'll be notified once your credentials are verified.
                    </p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="doctorDocument">Medical Degree/License Document *</Label>
                      <div className="relative">
                        <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="doctorDocument"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleInputChange("doctorDocument", e.target.files?.[0] || null)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload your medical degree or medical license (PDF, JPG, PNG - Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange("termsAccepted", checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}