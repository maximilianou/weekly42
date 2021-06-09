# weekly41
Makefile, kubernetes, cluster, docker, 2021.05

- Rethinking some tools: 

- [ ] Docker - container
- [ ] Kubernetes - nodes, services
- [ ] OpenFaas - Funciton as a Service - time limitless 
- [ ] K3d - cluster
- [ ] TSL - cert-manager 

- kubernetes/Vagrantfile
---
### Kubebernetes local cluster
- Kubebernetes local cluster, create with kubeadm, kubectl, kubelet
- Running in debian host, three debian, kmaster.local, kworker1, kworker2
- Using vagrant as a provisioner of this Infraestructure

```rb
# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure("2") do |config|
  config.vm.provision "shell", path: "bootstrap.sh"
  # Kubernetes Master Server
  config.vm.define "kmaster" do |node|
    node.vm.box               = "debian/buster64"
    node.vm.hostname          = "kmaster.local"
    node.vm.network "private_network", ip: "172.16.16.100"
    node.vm.provider :virtualbox do |v|
      v.name    = "kmaster"
      v.memory  = 2048
    end
    node.vm.provision "shell", path: "bootstrap_kmaster.sh"
  end
  # Kubernetes Worker Nodes
  NodeCount = 2
  (1..NodeCount).each do |i|
    config.vm.define "kworker#{i}" do |node|
      node.vm.box               = "debian/buster64"
      node.vm.hostname          = "kworker#{i}.local"
      node.vm.network "private_network", ip: "172.16.16.10#{i}"
      node.vm.provider :virtualbox do |v|
        v.name    = "kworker#{i}"
        v.memory  = 1024
        v.cpus    = 1
      end
     node.vm.provision "shell", path: "bootstrap_kworker.sh"
    end
  end
end
```

- kubernetes/bootstrap.sh
```sh
#!/bin/bash

echo "[TASK 1] Disable and turn off SWAP"
sed -i '/swap/d' /etc/fstab
swapoff -a

echo "[TASK 2] Stop and Disable firewall"
systemctl disable --now ufw >/dev/null 2>&1

echo "[TASK 3] Enable and Load Kernel modules"
mkdir /etc/docker
cat <<EOF | tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

echo "[TASK 4] Add Kernel settings"
cat >>/etc/sysctl.d/kubernetes.conf<<EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system >/dev/null 2>&1

echo "[TASK 5] Install containerd runtime"
apt-get -y update -qq >/dev/null 2>&1
apt-get -y -qq remove docker docker-engine docker.io runc >/dev/null 2>&1
apt-get -y -qq install apt-transport-https software-properties-common ca-certificates curl gnupg lsb-release; echo  'deb [arch=amd64] https://download.docker.com/linux/debian  buster stable' | tee /etc/apt/sources.list.d/docker.list > /dev/null ;  curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - ; add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian buster stable" ; apt-get -y -qq update; apt-get -y -qq remove docker docker-engine docker.io runc; apt-get -y -qq install docker-ce docker-ce-cli containerd.io; usermod -aG docker vagrant >/dev/null 2>&1
systemctl enable docker >/dev/null 2>&1
systemctl daemon-reload >/dev/null 2>&1
systemctl restart docker >/dev/null 2>&1

echo "[TASK 6] Add apt repo for kubernetes"
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - >/dev/null 2>&1
apt-add-repository "deb http://apt.kubernetes.io/ kubernetes-xenial main" >/dev/null 2>&1
apt-get -y update -qq >/dev/null 2>&1

echo "[TASK 7] Install Kubernetes components (kubeadm, kubelet and kubectl)"
apt-get install -qq -y kubeadm kubelet kubectl >/dev/null 2>&1

echo "[TASK 8] Enable ssh password authentication"
sed -i 's/^PasswordAuthentication .*/PasswordAuthentication yes/' /etc/ssh/sshd_config
echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config
systemctl reload sshd

echo "[TASK 9] Set root password"
echo -e "kubeadmin\nkubeadmin" | passwd root >/dev/null 2>&1
echo "export TERM=xterm" >> /etc/bash.bashrc

echo "[TASK 10] Update /etc/hosts file"
cat >>/etc/hosts<<EOF
172.16.16.100   kmaster.local     kmaster
172.16.16.101   kworker1.local    kworker1
172.16.16.102   kworker2.local    kworker2
EOF
```
- kubernetes/bootstrap_kmaster.sh
```sh
#!/bin/bash

echo "[TASK 1] Pull required containers"
kubeadm config images pull >/dev/null 2>&1

echo "[TASK 2] Initialize Kubernetes Cluster"
kubeadm init --apiserver-advertise-address=172.16.16.100 --pod-network-cidr=192.168.0.0/16 >> /root/kubeinit.log 2>/dev/null

echo "[TASK 3] Deploy Calico network"
kubectl --kubeconfig=/etc/kubernetes/admin.conf create -f https://docs.projectcalico.org/v3.18/manifests/calico.yaml >/dev/null 2>&1

echo "[TASK 4] Generate and save cluster join command to /joincluster.sh"
kubeadm token create --print-join-command > /joincluster.sh 2>/dev/null
```
- kubernetes/bootstrap_kworker.sh
```sh
#!/bin/bash

echo "[TASK 1] Join node to Kubernetes Cluster"
apt-get install -qq -y sshpass >/dev/null 2>&1
sshpass -p "kubeadmin" scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no kmaster.local:/joincluster.sh /joincluster.sh 2>/dev/null
bash /joincluster.sh >/dev/null 2>&1
```

