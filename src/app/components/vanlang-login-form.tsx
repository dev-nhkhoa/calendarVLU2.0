"use client"
import {
  useForm
} from "react-hook-form"
import {
  zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Button
} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Input
} from "@/components/ui/input"

const formSchema = z.object({
  mssv: z.string(),
  mssv_password: z.string()
});

export default function VanLangLoginForm() {

  const form = useForm < z.infer < typeof formSchema >> ({
    resolver: zodResolver(formSchema),

  })

  async function onSubmit(values: z.infer < typeof formSchema > ) {
    try {
      console.log(values);
      const fetch2Sv = await fetch(`/api/login?id=${values.mssv}&password=${values.mssv_password}`, {method: 'GET'})
      if (fetch2Sv.ok) {
        console.log("Login success");
        console.log(await fetch2Sv.json());
      } else {
        console.log("Login failed");
        }
    } catch (error) {
      console.error("Form submission error", error);
      
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
        
        <FormField
          control={form.control}
          name="mssv"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã số sinh viên</FormLabel>
              <FormControl>
                <Input 
                placeholder="2xxxxxxxxxxxx"
                
                type="text"
                {...field} />
              </FormControl>
              <FormDescription>Vui lòng nhập mã số sinh viên</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="mssv_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input placeholder="Placeholder" {...field} type="password"/>
              </FormControl>
              <FormDescription>Vui lòng nhập mật khẩu</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Đăng nhập</Button>
      </form>
    </Form>
  )
}