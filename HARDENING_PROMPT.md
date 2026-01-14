# Server Hardening Task for klimat22db

## Target Server
- **Hostname:** klimat22db
- **IP:** 85.198.99.209
- **SSH Key:** ~/.ssh/klimat22
- **Root Access:** Already configured (fresh install)

## Task
Harden the SSH and firewall configuration for klimat22db following the exact procedure in `docs/SECURITY_GUIDE.md`.

## Critical Requirements
1. Follow the guide EXACTLY - socket activation is required on Ubuntu 24.04
2. Create deploy user with passwordless sudo BEFORE Phase 2
3. Test each phase in NEW terminals before proceeding
4. Keep socket drop-in (`/etc/systemd/system/ssh.socket.d/10-extra-ports.conf`) AND SSH drop-in (`/etc/ssh/sshd_config.d/10-hardening.conf`) synchronized
5. Phase 1 ends with both ports 22 and 2222 working
6. Phase 2 ends with only port 2222 working, keys-only, no root, deploy user only

## Steps Summary

### STEP 0: Verify access
```bash
ssh -i ~/.ssh/klimat22 root@85.198.99.209 "echo ✓ SSH Access Verified"
```

### STEP 1-2: Deploy user + test
- Create deploy user with passwordless sudo
- Copy SSH key from root
- Test deploy user SSH and sudo work

### STEP 3-7: Phase 1 (dual ports, both auth methods)
- Backup SSH config
- Create socket drop-in (port 22 + 2222)
- Create SSH config drop-in (keys + passwords enabled)
- Test both ports from NEW terminals

### STEP 8-10: Phase 2 (single port 2222, keys only)
- Update socket drop-in (only 2222)
- Update SSH config drop-in (PermitRootLogin no, PasswordAuthentication no, AllowUsers deploy)
- Reload both socket and SSH
- Test port 2222 works

### STEP 11-14: Additional hardening
- Install and configure fail2ban (port 2222)
- Configure UFW firewall (allow 2222, 80, 443)
- Enable automatic security updates
- Verify final status

## Success Criteria
- ✅ Port 2222 is only SSH port listening
- ✅ Root login disabled
- ✅ Password authentication disabled
- ✅ Deploy user has passwordless sudo
- ✅ Firewall active (deny incoming, allow 2222/80/443)
- ✅ Fail2ban configured for SSH on port 2222
- ✅ Auto-updates enabled

## Return Summary
When complete, return:
1. Final verification output showing SSH security settings
2. Firewall status (UFW)
3. Fail2ban status
4. Confirmation that access works via: `ssh -i ~/.ssh/klimat22 -p 2222 deploy@85.198.99.209`

## Reference
Guide: `/home/coder/Projects/EfimKlimat22/docs/SECURITY_GUIDE.md`
Successful example: klimat22 (155.212.144.180) - already completed
