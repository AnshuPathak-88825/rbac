"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import profile from "../../src/app/assets/image/profile.svg";
import bin from "../../src/app/assets/image/bin.svg";
import edit from "../../src/app/assets/image/edit.svg";
import axios from "axios";

export default function Home() {
  type User = {
    id: string;
    name: string;
    email: string;
    roleId: string;
    status: string;
  };
  type Permission = "Read" | "Write" | "Delete";

  type Role = {
    id: string;
    name: string;
    permissions: Permission[];
    customAttributes: {
      dashboardAccess: boolean;
      prioritySupport: boolean;
    };
  };
  type FullInfo = {
    user: User;
    role: Role;
  };

  const [merged_info, setMerged_info] = useState<FullInfo[]>([]);
  const [NewUser, setNewUser] = useState<string>("");
  const [NewEmail, setNewEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [EditName, setEditName] = useState("");
  const [EditEmail, setEditEmail] = useState("");
  const [EditRole, setEditRole] = useState("");
  const [EditPermision, setEditPermission] = useState([]);
  useEffect(() => {
    fetchMergedInfo();
  }, []);

  const fetchMergedInfo = async () => {
    try {
      setLoading(true);
      const usersData = await axios.get<User[]>(`http://localhost:3001/users`);
      const rolesData = await axios.get<Role[]>(`http://localhost:3001/roles`);

      const mergedData = usersData.data
        .map((user) => {
          const role = rolesData.data.find((role) => role.id === user.roleId);
          return role ? { user, role } : null;
        })
        .filter(Boolean) as FullInfo[];

      setMerged_info(mergedData);
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoleAndUsers = async (UserId: string, RoleId: string) => {
    try {
      await axios.delete(`http://localhost:3001/users/${UserId}`);
      await axios.delete(`http://localhost:3001/roles/${RoleId}`);
      fetchMergedInfo();
    } catch (error) {
      console.log("Error deleting user/role:", error);
    }
  };

  const addUser = async () => {
    try {
      const roleOption = {
        name: "User",
        permissions: ["Read"],
        customAttributes: {
          dashboardAccess: true,
          prioritySupport: false,
        },
      };

      let newRole;
      try {
        newRole = await axios.post<Role>(
          "http://localhost:3001/roles",
          roleOption
        );
      } catch (roleError) {
        console.error("Error creating role:", roleError);
        throw new Error("Failed to create role. Please try again.");
      }

      const userOption = {
        name: NewUser,
        email: NewEmail,
        roleId: newRole.data.id,
        status: "Active",
      };
      try {
        const response = await axios.post<User>(
          "http://localhost:3001/users",
          userOption
        );
        console.log("User added successfully." + response.data.email);
      } catch (userError) {
        console.error("Error creating user:", userError);
        throw new Error("Failed to create user. Please try again.");
      }

      setNewUser("");
      setNewEmail("");
      await fetchMergedInfo();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };
  // Add function to handle editing user data
  const editUser = async (
    userId: string,
    roleId: string,
    UserInfo: User,
    RoleInfo: Role
  ) => {
    try {
      if (EditName != "") {
        UserInfo["name"] = EditName;
      }
      if (EditEmail != "") {
        UserInfo["email"] = EditEmail;
      }

      await axios.put(`http://localhost:3001/users/${userId}`, UserInfo);
      console.log("User updated successfully.");
      setEditName("");
      setEditEmail("");
      setEditPermission([]);
      await fetchMergedInfo(); // Refresh the user list
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };
  const Editstatus = async (value: string, user: User) => {
    try {
      user.status = value;
      await axios.put(`http://localhost:3001/users/${user.id}`, user);
      await fetchMergedInfo();
      console.log("updated status successfully");
    } catch (error) {
      console.error("Error updating user:", error);

    }


  }

  return (
    <div className="w-full m-auto">
      <Table>
        <TableCaption>A list of your recent users and roles.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead>Email address</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Access</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {merged_info.map((value, index) => (
            <TableRow key={index}>
              <TableCell>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Image src={profile} alt="Profile" height={20} width={20} />
                  <span>{value.user.name}</span>
                </div>
              </TableCell>
              <TableCell>{value.user.email}</TableCell>
              <TableCell>{value.role.name}</TableCell>
              <TableCell>
                {value.role.permissions.map((permission, i) => (
                  <div key={i}>{permission}</div>
                ))}
              </TableCell>
              <TableCell>
                <Select onValueChange={(v1) => Editstatus(v1, value.user)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={value.user.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

              </TableCell>
              <TableCell>
                <div className="flex">
                  <div
                    className="cursor-pointer p-1"
                    onClick={() =>
                      deleteRoleAndUsers(value.user.id, value.role.id)
                    }
                  >
                    <Image src={bin} alt="Delete" height={20} width={20} />
                  </div>
                  <div className="p-1 cursor-pointer">
                    <Dialog>
                      <DialogTrigger>
                        <Image src={edit} alt="Edit" height={20} width={20} />
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Information</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="name"
                              value={
                                EditName === "" ? value.user.name : EditName
                              }
                              className="col-span-3"
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                              Email
                            </Label>
                            <Input
                              id="email"
                              value={
                                EditEmail === "" ? value.user.email : EditEmail
                              }
                              className="col-span-3"
                              onChange={(e) => setNewEmail(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="Role" className="text-right">
                              Role
                            </Label>
                            <Input
                              id="role"
                              value={
                                EditRole === "" ? value.role.name : EditRole
                              }
                              className="col-span-3"
                              onChange={(e) => setNewEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={() => {
                              editUser(
                                value.user.id,
                                value.role.id,
                                value.user,
                                value.role
                              );
                            }}
                          >
                            Save changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Add New User</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={NewUser}
                className="col-span-3"
                onChange={(e) => setNewUser(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={NewEmail}
                className="col-span-3"
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={addUser}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
